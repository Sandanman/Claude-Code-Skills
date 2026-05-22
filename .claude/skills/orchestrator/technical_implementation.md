# Orchestrator 技术实现细节（v1.2）

本文档提供 Orchestrator 的底层技术实现代码示例。

---

## 1. 任务ID生成

```python
import time, random

def generate_task_id() -> str:
    """格式: YYYYMMDDHHMMSS_随机6位数字"""
    timestamp = time.strftime("%Y%m%d%H%M%S", time.localtime())
    random_suffix = random.randint(100000, 999999)
    return f"{timestamp}_{random_suffix}"
```

---

## 2. 文件锁机制

```python
import fcntl, os, time

class TaskFileLock:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.lock_path = f"{file_path}.lock"
        self.lock_fd = None

    def acquire(self, timeout: int = 30) -> bool:
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                self.lock_fd = open(self.lock_path, 'w')
                fcntl.flock(self.lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                self.lock_fd.write(f"{os.getpid()}_{time.time()}")
                self.lock_fd.flush()
                return True
            except (IOError, OSError):
                if self.lock_fd:
                    self.lock_fd.close()
                time.sleep(2)
        return False

    def release(self):
        if self.lock_fd:
            try:
                fcntl.flock(self.lock_fd, fcntl.LOCK_UN)
                self.lock_fd.close()
                if os.path.exists(self.lock_path):
                    os.remove(self.lock_path)
            except: pass
```

---

## 3. 原子写入

```python
import os, shutil

def atomic_write(file_path: str, content: str, encoding: str = 'utf-8'):
    """1.写临时文件 → 2.备份旧文件 → 3.原子重命名 → 4.清理备份"""
    temp_path = f"{file_path}.tmp"
    backup_path = f"{file_path}.bak"
    try:
        with open(temp_path, 'w', encoding=encoding) as f:
            f.write(content)
            f.flush()
            os.fsync(f.fileno())
        if os.path.exists(file_path):
            shutil.copy2(file_path, backup_path)
        os.rename(temp_path, file_path)
        if os.path.exists(backup_path):
            os.remove(backup_path)
    except Exception as e:
        if os.path.exists(temp_path): os.remove(temp_path)
        if os.path.exists(backup_path):
            shutil.copy2(backup_path, file_path)
            os.remove(backup_path)
        raise e
```

---

## 4. 文件恢复

```python
import os, shutil

def recover_task_file(file_path: str) -> dict:
    backup = f"{file_path}.bak"
    temp = f"{file_path}.tmp"
    for method, src in [("从备份", backup), ("从临时", temp)]:
        if os.path.exists(src):
            try:
                shutil.copy2(src, file_path)
                return {"success": True, "method": method}
            except: pass
    try:
        with open(file_path, 'w') as f:
            f.write(f"# 已重建 {datetime.now().isoformat()}\n# 状态: 需重建\n")
        return {"success": True, "method": "重建空文件"}
    except Exception as e:
        return {"success": False, "method": "无", "message": str(e)}
```

---

## 5. 历史数据清理

```python
import os, shutil
from datetime import datetime, timedelta

def cleanup_old_tasks(base_dir: str, retention_days: int = 180, dry_run: bool = True):
    cutoff = datetime.now() - timedelta(days=retention_days)
    archive_dir = os.path.join(os.path.dirname(base_dir), "archive")
    results = {"checked": 0, "archived": 0, "failed": 0, "details": []}
    if not dry_run: os.makedirs(archive_dir, exist_ok=True)
    for month_dir in os.listdir(base_dir):
        month_path = os.path.join(base_dir, month_dir)
        if not os.path.isdir(month_path): continue
        results["checked"] += 1
        try:
            month_date = datetime.strptime(month_dir, "%Y-%m")
            if month_date < cutoff:
                if not dry_run:
                    shutil.make_archive(
                        os.path.join(archive_dir, month_dir), 'gztar', month_path)
                    shutil.rmtree(month_path)
                results["archived"] += 1
                results["details"].append({"month": month_dir, "action": "archived"})
            else:
                results["details"].append({"month": month_dir, "action": "kept"})
        except Exception as e:
            results["failed"] += 1
            results["details"].append({"month": month_dir, "action": "failed", "error": str(e)})
    return results
```

---

## 6. 资源检查

```python
import os, shutil, psutil

def check_resources_before_execution(task: dict) -> dict:
    checks, warnings = {}, []
    try:
        du = shutil.disk_usage("/")
        free_mb = du.free / (1024*1024)
        checks["disk_sufficient"] = free_mb > 100
        if free_mb < 500: warnings.append(f"磁盘空间不足: {free_mb:.1f}MB")
    except: checks["disk_sufficient"] = False
    try:
        mem = psutil.virtual_memory()
        avail_mb = mem.available / (1024*1024)
        checks["memory_sufficient"] = avail_mb > 512
        if avail_mb < 1024: warnings.append(f"可用内存不足: {avail_mb:.1f}MB")
    except: checks["memory_sufficient"] = True
    skill_count = len(task.get("atomic_skills", []))
    checks["skill_count_ok"] = skill_count <= 20
    if skill_count > 15: warnings.append(f"原子skill数量较多: {skill_count}个")
    return {"all_passed": all(checks.values()), "checks": checks, "warnings": warnings}
```

---

## 7. 读写任务文件

```python
import yaml, json

def read_task_file(file_path: str) -> dict:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            return {"metadata": yaml.safe_load(parts[1]), "content": parts[2].strip(), "raw": content}
    return {"metadata": {}, "content": content, "raw": content}

def write_task_file(file_path: str, metadata: dict, content: str):
    frontmatter = yaml.dump(metadata, allow_unicode=True, default_flow_style=False)
    full = f"---\n{frontmatter}---\n\n{content}"
    atomic_write(file_path, full)
```

---

## 8. 并行执行协调

```python
from threading import Thread, Lock
from queue import Queue
import time

class ParallelSkillExecutor:
    def __init__(self, max_workers: int = 2):
        self.max_workers = max_workers
        self.lock = Lock()
        self.results_queue = Queue()

    def execute_parallel(self, skills: list, task_file: str):
        threads = []
        for skill in skills[:self.max_workers]:
            t = Thread(target=self._execute_skill, args=(skill, task_file))
            t.start()
            threads.append(t)
        for t in threads: t.join()
        results = []
        while not self.results_queue.empty():
            results.append(self.results_queue.get())
        return results

    def _execute_skill(self, skill: dict, task_file: str):
        try:
            result = execute_atomic_skill(skill)
            with self.lock:
                update_skill_status(task_file, skill["name"],
                                    "completed" if result.success else "failed",
                                    result.output)
            self.results_queue.put({"skill": skill["name"], "success": result.success, "output": result.output})
        except Exception as e:
            with self.lock:
                update_skill_status(task_file, skill["name"], "failed", str(e))
            self.results_queue.put({"skill": skill["name"], "success": False, "error": str(e)})
```

---

## 9. 时间处理工具

```python
from datetime import datetime, timezone, timedelta

class TimeUtils:
    @staticmethod
    def get_current_timestamp() -> str:
        tz = timezone(timedelta(hours=8))
        return datetime.now(tz).strftime("%Y-%m-%d %H:%M:%S")

    @staticmethod
    def get_archive_month() -> str:
        tz = timezone(timedelta(hours=8))
        return datetime.now(tz).strftime("%Y-%m")

    @staticmethod
    def parse_datetime(dt: str) -> datetime:
        return datetime.strptime(dt, "%Y-%m-%d %H:%M:%S")

    @staticmethod
    def calculate_duration(start: str, end: str) -> str:
        s, e = TimeUtils.parse_datetime(start), TimeUtils.parse_datetime(end)
        dur = e - s
        h, m, sec = int(dur.total_seconds()//3600), int((dur.total_seconds()%3600)//60), int(dur.total_seconds()%60)
        return f"{h:02d}:{m:02d}:{sec:02d}"
```

---

## 10. 流式输出

```python
import sys, time, threading
from datetime import datetime

class StreamOutput:
    COLORS = {"red": "\033[91m", "green": "\033[92m", "yellow": "\033[93m",
               "blue": "\033[94m", "cyan": "\033[96m", "magenta": "\033[95m", "white": "\033[97m", "reset": "\033[0m"}
    LEVEL_COLORS = {
        "TASK_START": "cyan", "SKILL_START": "blue", "SKILL_SUCCESS": "green",
        "SKILL_FAIL": "red", "WARNING": "yellow", "VALIDATION": "blue",
        "REFLECTION": "yellow", "ARCHIVE": "white", "SUMMARY": "magenta",
    }

    def __init__(self, enabled=True, show_progress_bar=True, color_output=True, task_file=None):
        self.enabled = enabled
        self.show_progress_bar = show_progress_bar
        self.color_output = color_output
        self.task_file = task_file
        self._task_start_time = None
        self._skill_start_times = {}
        self._lock = threading.Lock()

    def _colorize(self, text: str, color: str) -> str:
        if not self.color_output or color not in self.COLORS: return text
        return f"{self.COLORS[color]}{text}{self.COLORS['reset']}"

    def _print(self, level: str, msg: str):
        color = self.LEVEL_COLORS.get(level, "white")
        with self._lock:
            print(self._colorize(msg, color), flush=True)

    def _get_duration(self, start: float) -> str:
        elapsed = time.time() - start
        if elapsed < 60: return f"{elapsed:.1f}秒"
        elif elapsed < 3600: return f"{elapsed/60:.1f}分钟"
        else: return f"{elapsed/3600:.1f}小时"

    def task_start(self, task_id, main_skill, total_skills, intent_summary=None, complexity_score=None, confidence=None):
        if not self.enabled: return
        self._task_start_time = time.time()
        self._print("TASK_START", f"\n🚀 任务开始 | {task_id}")
        self._print("TASK_START", f"   主技能: {main_skill}, 共{total_skills}个")
        if complexity_score is not None:
            lvl = "🟢 简单" if complexity_score <= 3 else "🟡 一般" if complexity_score <= 6 else "🟠 复杂" if complexity_score <= 8 else "🔴 非常复杂"
            self._print("TASK_START", f"   复杂度: {lvl} (score={complexity_score}/10)")
        if confidence is not None and confidence < 0.6:
            self._print("TASK_START", f"   ⚠️ 意图置信度较低: {confidence:.0%}")

    def skill_start(self, skill_name, skill_index, total_skills, skill_desc=None, parallel_group=None):
        if not self.enabled: return
        self._skill_start_times[skill_name] = time.time()
        progress = skill_index / total_skills
        bar = "▓" * int(20*progress) + "░" * (20-int(20*progress))
        hint = f" [并行组{parallel_group}]" if parallel_group else ""
        self._print("SKILL_START", f"\n⚡ 执行 {skill_index}/{total_skills}{hint}")
        self._print("SKILL_START", f"   技能: {skill_name}")
        if self.show_progress_bar:
            self._print("SKILL_START", f"   进度: [{bar}] {int(progress*100)}% (剩余{total_skills-skill_index}个)")

    def skill_success(self, skill_name, skill_index, total_skills, result_summary=None, elapsed=None):
        if not self.enabled: return
        dur = self._get_duration(self._skill_start_times.pop(skill_name, time.time())) if elapsed is None else self._get_duration(elapsed)
        self._print("SKILL_SUCCESS", f"\n✅ {skill_name} 完成")
        self._print("SKILL_SUCCESS", f"   耗时: {dur} | 剩余: {total_skills-skill_index} 个")
        if result_summary:
            summary = result_summary[:80]+"..." if len(result_summary)>80 else result_summary
            self._print("SKILL_SUCCESS", f"   结果: {summary}")

    def skill_fail(self, skill_name, error_msg, will_retry=False, retry_count=0, max_retries=3):
        if not self.enabled: return
        if will_retry:
            self._print("SKILL_FAIL", f"\n⚠️ {skill_name} 失败（第{retry_count}/{max_retries}次重试）")
        else:
            self._print("SKILL_FAIL", f"\n❌ {skill_name} 失败")
        self._print("SKILL_FAIL", f"   错误: {error_msg[:100]}")

    def task_summary(self, task_id, success_count, fail_count, skip_count, total_elapsed, main_skill, goal_achieved=True):
        if not self.enabled: return
        dur = self._get_duration(self._task_start_time) if self._task_start_time else self._get_duration(total_elapsed)
        rate = success_count/(success_count+fail_count+skip_count) if (success_count+fail_count+skip_count)>0 else 0
        status = "✅ 任务完成" if goal_achieved else "⚠️ 任务部分完成"
        color = "green" if goal_achieved else "yellow"
        self._print("SUMMARY", f"\n{self._colorize(status+f' | {task_id}', color)}")
        self._print("SUMMARY", f"   总耗时: {dur}")
        self._print("SUMMARY", f"   技能执行: {success_count}成功 / {fail_count}失败 / {skip_count}跳过")
        self._print("SUMMARY", f"   成功率: {rate:.0%}")

    def disable(self): self.enabled = False
    def enable(self): self.enabled = True
```

---

## 11. Token追踪

```python
import time
from typing import List, Dict, Any

class TokenTracker:
    def __init__(self,
                 session_budget=1_000_000,
                 task_budget=200_000,
                 warning_threshold=0.8,
                 input_cost_per_1k=3.0,
                 output_cost_per_1k=15.0,
                 task_file=None):
        self.session_total = {"input_tokens":0,"output_tokens":0,"total_tokens":0,"total_cost":0.0,"call_count":0}
        self.task_total = {"input_tokens":0,"output_tokens":0,"total_tokens":0,"total_cost":0.0,"call_count":0}
        self.task_id = None
        self.task_start_time = None
        self.skill_records: List[Dict] = []
        self.session_budget = session_budget
        self.task_budget = task_budget
        self.warning_threshold = warning_threshold
        self.input_cost_per_1k = input_cost_per_1k
        self.output_cost_per_1k = output_cost_per_1k
        self.task_file = task_file
        self._warned = set()

    def start_task(self, task_id: str):
        self.task_id = task_id
        self.task_start_time = time.time()
        self.task_total = {"input_tokens":0,"output_tokens":0,"total_tokens":0,"total_cost":0.0,"call_count":0}
        self.skill_records = []
        self._warned = set()

    def record_skill_usage(self, skill_name: str, input_tokens: int, output_tokens: int, model="claude-sonnet-4-20250514", is_intent=False):
        total = input_tokens + output_tokens
        cost = (input_tokens/1000*self.input_cost_per_1k + output_tokens/1000*self.output_cost_per_1k)
        for d in [self.session_total, self.task_total]:
            d["input_tokens"] += input_tokens
            d["output_tokens"] += output_tokens
            d["total_tokens"] += total
            d["total_cost"] += cost
            d["call_count"] += 1
        self.skill_records.append({
            "skill_name": skill_name, "input_tokens": input_tokens,
            "output_tokens": output_tokens, "total_tokens": total,
            "cost": cost, "model": model, "is_intent": is_intent,
            "timestamp": time.strftime("%H:%M:%S")
        })
        # 控制台输出
        label = "意图识别" if skill_name == "LLM_INTENT_RECOGNITION" else skill_name
        print(f"💰 {label}: +{total:,} token (输入:{input_tokens:,} 输出:{output_tokens:,}), 成本 ${cost:.4f}", file=sys.stderr)
        # 预警检查
        self._check_warning(skill_name)
        # 写入文件
        if self.task_file:
            try:
                with open(self.task_file, "a") as f:
                    f.write(f"[{time.strftime('%H:%M:%S')}] 💰 {skill_name}: +{total:,} token, 成本 ${cost:.4f}\n")
            except: pass

    def _calculate_cost(self, inp, out):
        return inp/1000*self.input_cost_per_1k + out/1000*self.output_cost_per_1k

    def _check_warning(self, skill_name: str):
        if skill_name in self._warned: return
        ratio = max(
            self.task_total["total_tokens"]/self.task_budget,
            self.session_total["total_tokens"]/self.session_budget
        )
        if ratio >= self.warning_threshold:
            self._warned.add(skill_name)
            pct = int(ratio*100)
            print(f"\n⚠️  Token 消耗预警：任务已消耗 {pct}% 预算", file=sys.stderr)
            print(f"   已用: {self.task_total['total_tokens']:,} / {self.task_budget:,} token", file=sys.stderr)
            if ratio >= 0.95:
                print(f"   🚨 接近预算上限，建议检查任务是否需要终止", file=sys.stderr)

    def get_task_summary(self) -> dict:
        elapsed = time.time()-self.task_start_time if self.task_start_time else 0
        return {
            "task_id": self.task_id,
            "duration_seconds": round(elapsed, 1),
            "total_tokens": self.task_total["total_tokens"],
            "input_tokens": self.task_total["input_tokens"],
            "output_tokens": self.task_total["output_tokens"],
            "total_cost_usd": round(self.task_total["total_cost"], 6),
            "call_count": self.task_total["call_count"],
            "budget_usage_pct": round(self.task_total["total_tokens"]/self.task_budget*100, 1),
            "avg_tokens_per_call": self.task_total["total_tokens"]//max(self.task_total["call_count"],1),
            "by_skill": [{**r, "cost": round(r["cost"],6)} for r in self.skill_records]
        }

    def print_task_summary(self):
        s = self.get_task_summary()
        print(f"\n💰 Token 消耗摘要（任务 {s['task_id']}）")
        print(f"   总消耗: {s['total_tokens']:,} token (输入:{s['input_tokens']:,} 输出:{s['output_tokens']:,})")
        print(f"   预估成本: ${s['total_cost_usd']:.4f}")
        print(f"   调用次数: {s['call_count']} 次，平均 {s['avg_tokens_per_call']:,} token/次")
        print(f"   预算使用: {s['budget_usage_pct']:.1f}%")
        print(f"   耗时: {s['duration_seconds']:.1f} 秒")
```

---

## 12. 上下文读取

```python
import os, json

def load_project_context(context_path: str = ".claude/project_context.json") -> str:
    """读取项目上下文，返回字符串或None"""
    if os.path.exists(context_path):
        try:
            with open(context_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return json.dumps(data, ensure_ascii=False)
        except Exception as e:
            print(f"[上下文] 读取失败: {e}")
    return None

def load_monthly_index(year_month: str) -> list:
    """读取月度索引，返回任务列表"""
    index_path = f".claude/skills/tasks/history/{year_month}/月度任务索引.md"
    if not os.path.exists(index_path):
        return []
    # 简单解析：提取表格中的每行数据
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()
    entries = []
    for line in content.split('\n'):
        if line.startswith('|') and not line.startswith('|--') and 'task_skill' in line:
            parts = [p.strip() for p in line.split('|')]
            if len(parts) >= 7:
                entries.append({
                    "task_id": parts[1],
                    "archive_time": parts[2],
                    "intent_summary": parts[3],
                    "main_skill": parts[4],
                    "result_summary": parts[5],
                    "similarity_features": parts[6],
                    "archive_path": parts[7] if len(parts) > 7 else "",
                })
    return entries
```

---

## 13. 反思日志生成

```python
def generate_reflection_log(adjustments_history: list,
                             success: bool,
                             deviation: float = 0.0,
                             max_length: int = 300) -> str:
    """生成反思日志（最多300字）"""
    if not adjustments_history:
        return "反思日志：无调整记录"

    lines = []
    if success:
        lines.append(f"✅ 反思成功（偏差: {deviation:.1%}）")
    else:
        lines.append(f"❌ 反思失败（偏差: {deviation:.1%}，已达最大次数）")

    for adj in adjustments_history:
        lines.append(f"- 第{adj['attempt']}次: {', '.join(i['description'] for i in adj['issues'])}")

    if success and adjustments_history:
        lines.append(f"✅ 最终偏差: {deviation:.1%}，已达标")

    log = '\n'.join(lines)
    if len(log) > max_length:
        return log[:max_length-3] + "..."
    return log
```

---

**版本**: 1.2
**最后更新**: 2026-05-21