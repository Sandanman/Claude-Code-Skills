# Orchestrator Pro 技术实现细节（v1.0）

本文档提供 Orchestrator Pro 的底层技术实现代码示例，集成华为韬定律的 τ 增强功能。

---

## 1. τ 元数据结构

```python
from dataclasses import dataclass, field
from typing import Dict, List, Optional

@dataclass
class TauMetadata:
    """τ 元数据 — 贯穿整个编排链路的性能追踪"""
    task_id: str
    tier: str = "moderate"          # simple / moderate / complex
    budget_total: float = 15000.0
    allocations: Dict[str, float] = field(default_factory=dict)
    consumed: Dict[str, float] = field(default_factory=lambda: {
        "intent": 0.0, "match": 0.0, "plan": 0.0,
        "exec": 0.0, "validate": 0.0, "archive": 0.0
    })
    fold_count: int = 0
    fold_history: List[dict] = field(default_factory=list)
    pattern_discount: float = 0.0
    stack_discount: float = 0.0
    efficiency_score: float = 0.0
    co_design: Dict[str, dict] = field(default_factory=dict)

    def get_remaining_pct(self) -> float:
        total_consumed = sum(self.consumed.values())
        return (self.budget_total - total_consumed) / self.budget_total

    def get_remaining(self, step: str) -> float:
        return self.allocations.get(step, 0.0) - self.consumed.get(step, 0.0)


@dataclass
class StackMetadata:
    """Skill Stacking 上下文命中元数据"""
    total_read_attempts: int = 0
    shared_context_hits: int = 0
    reparse_events: List[dict] = field(default_factory=list)

    def get_hit_rate(self) -> float:
        return self.shared_context_hits / self.total_read_attempts \
            if self.total_read_attempts > 0 else 0.0


@dataclass
class PatternResult:
    """Pattern Mining 结果"""
    matched_count: int = 0
    matched_patterns: List[dict] = field(default_factory=list)
    aggregate_discount: float = 0.0
    reuse_rate: float = 0.0
    tau_savings: float = 0.0
```

---

## 2. τ-Controller 完整实现

```python
import time
from typing import Dict, List, Optional

class TauController:
    """τ 控制中心 — 贯穿 Orchestrator Pro 全程的横切控制器"""

    def __init__(self, config: dict):
        self.meta = TauMetadata(task_id="", tier="moderate")
        self.config = config
        self._step_start_time: Optional[float] = None

    def allocate_budget(self, task_id: str, complexity_score: int):
        """根据复杂度分配 τ 预算（步骤 1 后调用）"""
        self.meta.task_id = task_id
        if complexity_score <= 3:
            tier = "simple"
        elif complexity_score <= 6:
            tier = "moderate"
        else:
            tier = "complex"

        self.meta.tier = tier
        budgets = self.config["TAU_BUDGETS"][tier]
        self.meta.budget_total = budgets["total"]
        self.meta.allocations = budgets.copy()

    def start_step(self, step: str):
        """记录步骤开始时间"""
        self._step_start_time = time.time()

    def record_step(self,
                    step: str,
                    duration_ms: float,
                    tokens: int,
                    skill_name: str = None) -> dict:
        """记录步骤 τ 消耗"""
        tau = self._measure_tau(duration_ms, tokens)

        if step not in self.meta.consumed:
            self.meta.consumed[step] = 0.0
        self.meta.consumed[step] += tau

        total_consumed = sum(self.meta.consumed.values())
        remaining_total = self.meta.budget_total - total_consumed
        remaining_pct = remaining_total / self.meta.budget_total

        warnings = self._check_warnings(remaining_pct)

        return {
            "tau": round(tau, 2),
            "step": step,
            "step_consumed": round(self.meta.consumed.get(step, 0.0), 2),
            "step_remaining": round(self.meta.get_remaining(step), 2),
            "total_consumed": round(total_consumed, 2),
            "total_remaining": round(remaining_total, 2),
            "remaining_pct": round(remaining_pct, 4),
            "warnings": warnings,
        }

    def _measure_tau(self, duration_ms: float, tokens: int) -> float:
        """τ = duration_ms × 0.5 + tokens × 0.001"""
        return duration_ms * 0.5 + tokens * 0.001

    def _check_warnings(self, remaining_pct: float) -> List[dict]:
        """τ 预警检查"""
        warnings = []
        if remaining_pct <= 0.0:
            warnings.append({"level": "abort", "message": "τ 预算已耗尽"})
        elif remaining_pct <= 0.05:
            warnings.append({"level": "critical", "message": f"τ 剩余 {remaining_pct:.1%}，即将终止"})
        elif remaining_pct <= 0.20:
            warnings.append({"level": "warning", "message": f"τ 剩余 {remaining_pct:.1%}，谨慎执行"})
        return warnings

    def should_fold(self,
                    tau_remaining_pct: float,
                    current_depth: int,
                    fold_triggers: dict) -> dict:
        """判断是否需要 Task Folding"""
        can_fold = (
            tau_remaining_pct < fold_triggers["tau_remaining_pct"]
            and current_depth > fold_triggers["depth_threshold"]
            and self.meta.fold_count < fold_triggers["max_fold_depth"]
        )
        reasons = []
        if tau_remaining_pct < fold_triggers["tau_remaining_pct"]:
            reasons.append(f"τ={tau_remaining_pct:.1%} < {fold_triggers['tau_remaining_pct']:.1%}")
        elif current_depth > fold_triggers["depth_threshold"]:
            reasons.append(f"depth={current_depth} > {fold_triggers['depth_threshold']}")
        elif self.meta.fold_count >= fold_triggers["max_fold_depth"]:
            reasons.append(f"已达折叠上限({self.meta.fold_count})")
        return {"should_fold": can_fold, "trigger": "; ".join(reasons)}

    def should_emergency_fold(self, next_skill_tau: float) -> dict:
        """紧急折叠判断（步骤 5 中实时调用）"""
        remaining = self.meta.budget_total - sum(self.meta.consumed.values())
        if next_skill_tau > remaining * 0.5:
            return {
                "emergency_fold": True,
                "reason": f"skill_τ={next_skill_tau:.0f} > remaining×50%={remaining*0.5:.0f}",
                "suggestion": "skip_optional",
            }
        return {"emergency_fold": False}

    def record_fold(self, skill_name: str, reason: str):
        """记录一次折叠"""
        self.meta.fold_history.append({
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "skill_name": skill_name,
            "reason": reason,
        })
        self.meta.fold_count += 1

    def calculate_efficiency_score(self,
                                    task_quality: float,
                                    pattern_discount: float = 0.0,
                                    stack_discount: float = 0.0) -> float:
        """τ 效率评分"""
        self.meta.pattern_discount = pattern_discount
        self.meta.stack_discount = stack_discount

        total_consumed = sum(self.meta.consumed.values())
        utilization = total_consumed / self.meta.budget_total if self.meta.budget_total > 0 else 1.0
        quality_factor = task_quality * (1 - pattern_discount) * (1 - stack_discount)
        score = quality_factor / utilization if utilization > 0 else 0.0
        self.meta.efficiency_score = score
        return score

    def generate_tau_report(self) -> str:
        """生成 τ 分解报告"""
        total = sum(self.meta.consumed.values())
        total_budget = self.meta.budget_total
        utilization = total / total_budget if total_budget > 0 else 0.0

        grade = "优秀" if self.meta.efficiency_score > 0.8 else \
                "合格" if self.meta.efficiency_score >= 0.5 else "不合格"
        grade_emoji = {"优秀": "🟢", "合格": "🟡", "不合格": "🔴"}[grade]

        step_names = {
            "intent": "意图识别", "match": "技能匹配", "plan": "任务规划",
            "exec": "执行控制", "validate": "结果校验", "archive": "任务归档",
        }

        lines = [
            "## τ 分解报告",
            f"   总消耗: {total:.0f} / {total_budget:.0f} ({utilization:.1%})",
        ]

        for step, name in step_names.items():
            c = self.meta.consumed.get(step, 0.0)
            a = self.meta.allocations.get(step, 0.0)
            pct = c / total if total > 0 else 0.0
            flag = "⚠️" if c > a * 1.1 else ""
            lines.append(f"   ├─ {name:<6}: {c:>6.0f} ({pct:.1%}) [预算{a:.0f}] {flag}")

        lines.append(f"   效率评分: {self.meta.efficiency_score:.2f} ({grade}) {grade_emoji}")
        lines.append(f"   折叠次数: {self.meta.fold_count}")
        for f in self.meta.fold_history:
            lines.append(f"   └─ 折叠: {f.get('skill_name')}（{f.get('reason')}）")
        lines.append(f"   模式折扣: {self.meta.pattern_discount:.0%} τ节省")
        lines.append(f"   堆叠折扣: {self.meta.stack_discount:.0%} τ节省")

        return "\n".join(lines)
```

---

## 3. Skill Stacking 上下文管理器

```python
class SharedContextManager:
    """Skill Stacking 共享上下文管理器（类比 TSV 垂直互联）"""

    def __init__(self, task_file: str):
        self.task_file = task_file
        self.stack_meta = StackMetadata()
        self._lock = threading.Lock()

    def write_context(self, skill_name: str, key: str, value: any):
        """上游 skill 写入共享上下文"""
        with self._lock:
            # 追加到 task_skill.md 的共享上下文区域
            content = f"\n<!-- {skill_name}:{key} -->\n{value}\n<!-- /{skill_name}:{key} -->\n"
            append_to_file(self.task_file, content)

    def read_context(self, skill_name: str, key: str) -> Optional[any]:
        """下游 skill 从共享上下文读取（优先于重新解析）"""
        self.stack_meta.total_read_attempts += 1

        with self._lock:
            content = read_file(self.task_file)
            marker = f"<!-- {skill_name}:{key} -->"

        if marker in content:
            self.stack_meta.shared_context_hits += 1
            start = content.index(marker) + len(marker)
            end = content.index(f"<!-- /{skill_name}:{key} -->", start)
            return content[start:end].strip()

        # 未命中，记录 reparse
        self.stack_meta.reparse_events.append({
            "skill": skill_name, "key": key,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        })
        return None
```

---

## 4. Pattern Mining 完整实现

```python
import os, hashlib

class PatternMiner:
    """Pattern Mining 模式挖掘器"""

    def __init__(self, library_base: str = ".claude/skills/patterns/"):
        self.library_base = library_base

    def extract_pattern_features(self, intent: dict, skill_results: dict) -> dict:
        """从任务中提取 pattern 特征"""
        skill_sequence = tuple(
            r["skill_name"]
            for r in sorted(skill_results.values(), key=lambda x: x.get("order", 0))
            if r.get("status") == "completed"
        ) if skill_results else ()

        return {
            "domain_action": f"{intent.get('domain')}_{intent.get('action')}",
            "target_pattern": f"{intent.get('target', {}).get('type')}_{len(intent.get('target', {}).get('name', ''))}",
            "complexity_band": "low" if intent.get("complexity_score", 5) <= 3 else \
                              "mid" if intent.get("complexity_score", 5) <= 6 else "high",
            "skill_sequence": skill_sequence,
            "constraint_types": tuple(sorted(intent.get("constraints", []))),
            "keyword_set": frozenset(intent.get("keywords", [])),
            "original_intent_id": intent.get("intent_id"),
        }

    def search_patterns(self,
                         intent: dict,
                         skill_results: dict,
                         threshold: float = 0.60) -> PatternResult:
        """在模式库中搜索相似模式"""
        features = self.extract_pattern_features(intent, skill_results)
        matched = []

        if not os.path.exists(self.library_base):
            return PatternResult()

        for category in os.listdir(self.library_base):
            cat_path = os.path.join(self.library_base, category)
            if not os.isdir(cat_path):
                continue
            for pf in os.listdir(cat_path):
                if not pf.endswith(".md"):
                    continue
                pattern = self._read_pattern_file(os.path.join(cat_path, pf))
                if not pattern.get("enabled", True):
                    continue

                sim = self._calculate_similarity(features, pattern.get("features", {}))
                if sim >= threshold:
                    maturity = pattern.get("maturity", "new")
                    discount = {"mature": 0.70, "growing": 0.40, "experimental": 0.10, "new": 0.00}.get(maturity, 0.0)
                    matched.append({
                        "pattern_id": pattern.get("pattern_id"),
                        "pattern_name": pattern.get("pattern_name"),
                        "category": category,
                        "similarity": round(sim, 3),
                        "tau_discount": discount,
                        "maturity": maturity,
                        "matched_steps": list(features.get("skill_sequence", ())),
                    })

        matched.sort(key=lambda x: x["similarity"], reverse=True)

        if matched:
            total_discount = sum(m["tau_discount"] for m in matched[:3]) / min(len(matched), 3)
            return PatternResult(
                matched_count=len(matched),
                matched_patterns=matched[:5],
                aggregate_discount=round(total_discount, 3),
                reuse_rate=len(matched) / 10.0,  # 简化
            )
        return PatternResult()

    def store_pattern(self,
                       features: dict,
                       intent: dict,
                       tau_metadata: TauMetadata,
                       category: str = None) -> dict:
        """将新任务模式存入模式库"""
        domain = intent.get("domain", "general")
        action = intent.get("action", "unknown")
        category = category or f"{domain}-{action}"
        cat_dir = os.path.join(self.library_base, category)
        os.makedirs(cat_dir, exist_ok=True)

        pattern_id = hashlib.md5(
            str(features.get("skill_sequence", "")).encode()
        ).hexdigest()[:8]

        pattern_content = f"""# Pattern: {pattern_id}

**类别**: {category}
**成熟度**: new
**验证次数**: 1
**τ 折扣**: 0%
**最后使用**: {time.strftime("%Y-%m-%d")}
**使用次数**: 1

## 触发条件
- domain: {intent.get('domain')}
- action: {intent.get('action')}
- complexity_band: {features.get('complexity_band')}

## 执行步骤
{list(features.get('skill_sequence', ()))}

## τ 收益
- 首次存储，尚无验证
"""

        file_path = os.path.join(cat_dir, f"{pattern_id}.md")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(pattern_content)

        return {"stored": True, "pattern_id": pattern_id, "category": category}
```

---

## 5. τ 增强的流式输出

```python
class StreamOutputPro(StreamOutput):
    """τ 增强版流式输出"""

    def skill_skip(self, skill_name: str, reason: str):
        """折叠跳过输出"""
        self._print("SKIP", f"\n⏭️ {skill_name} 已跳过")
        self._print("SKIP", f"   原因: {reason}")

    def tau_warning(self, level: str, message: str):
        """τ 预警输出"""
        colors = {"warning": "yellow", "critical": "red", "abort": "magenta"}
        self._print(f"TAU_{level.upper()}", f"   τ {message}")
```

---

## 6. Orchestrator Pro 集成入口

```python
def run_orchestrator_pro(user_input: str,
                          config: dict,
                          skills_register: list) -> dict:
    """
    Orchestrator Pro 主入口
    """
    # ===== 步骤 1：意图识别 + τ 初始化 =====
    intent = recognize_intent(user_input, skills_register)
    tau_controller = TauController(config)
    tau_controller.allocate_budget(
        task_id=generate_task_id(),
        complexity_score=intent["complexity_assessment"]["complexity_score"]
    )

    # ===== 步骤 2：历史检索 + Pattern Mining 双轨 =====
    history_result = retrieve_similar_history(intent, ...)
    pattern_miner = PatternMiner()
    pattern_result = pattern_miner.search_patterns(intent, {}, threshold=0.60)
    tau_controller.meta.pattern_discount = pattern_result.aggregate_discount

    # ===== 步骤 3-9：其余步骤（见 SKILL.md）=====
    ...

    # ===== 步骤 8：τ 分解报告 =====
    tau_report = tau_controller.generate_tau_report()
    print(tau_report)

    return result
```

---

**版本**: 1.0
**最后更新**: 2026-06-02
**基于**: Orchestrator v1.2 technical_implementation.md + 华为韬定律