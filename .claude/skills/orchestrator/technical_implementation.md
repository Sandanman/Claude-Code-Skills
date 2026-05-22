# 技术实现细节

本文档提供 Orchestrator Reasoner 的技术实现代码示例和底层机制。

---

## 1. 任务ID生成

```python
import time
import random
from datetime import datetime

def generate_task_id() -> str:
    """
    生成唯一任务ID
    格式: YYYYMMDDHHMMSS_随机6位数字
    """
    timestamp = time.strftime("%Y%m%d%H%M%S", time.localtime())
    random_suffix = random.randint(100000, 999999)
    return f"{timestamp}_{random_suffix}"

# 示例输出
# 20260407143025_482935
# 20260407143025_738291 (同一秒的另一任务)
```

---

## 2. 文件锁机制

```python
import fcntl
import os
import time

class TaskFileLock:
    """
    任务文件锁，防止并发写入冲突
    """
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.lock_path = f"{file_path}.lock"
        self.lock_fd = None

    def acquire(self, timeout: int = 30) -> bool:
        """
        获取文件锁
        Args:
            timeout: 超时时间（秒）
        Returns:
            True: 成功获取锁
            False: 超时失败
        """
        start_time = time.time()

        while time.time() - start_time < timeout:
            try:
                # 尝试创建并锁定文件
                self.lock_fd = open(self.lock_path, 'w')
                fcntl.flock(self.lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)

                # 写入锁信息（用于调试）
                lock_info = f"{os.getpid()}_{time.time()}"
                self.lock_fd.write(lock_info)
                self.lock_fd.flush()

                return True

            except (IOError, OSError):
                # 锁被占用，等待重试
                if self.lock_fd:
                    self.lock_fd.close()
                time.sleep(2)
                continue

        return False  # 超时

    def release(self):
        """
        释放文件锁
        """
        if self.lock_fd:
            try:
                fcntl.flock(self.lock_fd, fcntl.LOCK_UN)
                self.lock_fd.close()
                if os.path.exists(self.lock_path):
                    os.remove(self.lock_path)
            except:
                pass

# 使用示例
# lock = TaskFileLock("tasks/current/task_skill.md")
# if lock.acquire(timeout=30):
#     try:
#         # 执行文件写入操作
#         write_task_file(...)
#     finally:
#         lock.release()
```

---

## 3. 原子写入

```python
import os
import shutil

def atomic_write(file_path: str, content: str, encoding: str = 'utf-8'):
    """
    原子写入文件，避免部分写入导致的数据损坏

    流程:
    1. 写入临时文件
    2. 备份旧文件（如果存在）
    3. 原子重命名临时文件
    4. 清理备份

    Args:
        file_path: 目标文件路径
        content: 文件内容
        encoding: 编码格式
    """
    temp_path = f"{file_path}.tmp"
    backup_path = f"{file_path}.bak"

    try:
        # 1. 写入临时文件
        with open(temp_path, 'w', encoding=encoding) as f:
            f.write(content)
            f.flush()
            os.fsync(f.fileno())  # 强制写入磁盘

        # 2. 备份旧文件（如果存在）
        if os.path.exists(file_path):
            shutil.copy2(file_path, backup_path)

        # 3. 原子重命名（POSIX保证原子性）
        os.rename(temp_path, file_path)

        # 4. 清理备份
        if os.path.exists(backup_path):
            os.remove(backup_path)

    except Exception as e:
        # 清理临时文件
        if os.path.exists(temp_path):
            os.remove(temp_path)

        # 尝试恢复备份
        if os.path.exists(backup_path):
            shutil.copy2(backup_path, file_path)
            os.remove(backup_path)

        raise e

# 使用示例
# atomic_write("tasks/current/task_skill.md", task_content)
```

---

## 4. 文件恢复机制

```python
import os
import shutil

def recover_task_file(file_path: str) -> dict:
    """
    恢复损坏或丢失的任务文件

    Args:
        file_path: 任务文件路径

    Returns:
        {
            "success": bool,
            "method": str,
            "message": str
        }
    """
    backup_path = f"{file_path}.bak"
    temp_path = f"{file_path}.tmp"

    # 优先级：备份 > 临时 > 重建

    # 1. 尝试从备份恢复
    if os.path.exists(backup_path):
        try:
            shutil.copy2(backup_path, file_path)
            return {
                "success": True,
                "method": "从备份恢复",
                "message": f"成功从 {backup_path} 恢复"
            }
        except Exception as e:
            pass

    # 2. 尝试从临时文件恢复
    if os.path.exists(temp_path):
        try:
            shutil.copy2(temp_path, file_path)
            return {
                "success": True,
                "method": "从临时文件恢复",
                "message": f"成功从 {temp_path} 恢复"
            }
        except Exception as e:
            pass

    # 3. 重建空文件
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write("# 任务文件已重建\n")
            f.write(f"# 时间: {datetime.now().isoformat()}\n")
            f.write(f"# 原因: 文件丢失或损坏\n\n")
            f.write("# 任务基础信息\n")
            f.write("任务ID: UNKNOWN\n")
            f.write("状态: 需重建\n")

        return {
            "success": True,
            "method": "重建空文件",
            "message": "已创建空任务文件，需手动补充信息"
        }
    except Exception as e:
        return {
            "success": False,
            "method": "无",
            "message": f"恢复失败: {str(e)}"
        }
```

---

## 5. 历史数据清理

```python
import os
import shutil
from datetime import datetime, timedelta

def cleanup_old_tasks(base_dir: str = "tasks/history",
                     retention_days: int = 180,
                     dry_run: bool = False):
    """
    清理过期历史任务，归档到压缩文件

    Args:
        base_dir: 历史任务根目录
        retention_days: 保留天数
        dry_run: 是否仅模拟（不实际执行）
    """
    cutoff_date = datetime.now() - timedelta(days=retention_days)
    archive_dir = os.path.join(os.path.dirname(base_dir), "archive")

    results = {
        "checked": 0,
        "archived": 0,
        "failed": 0,
        "details": []
    }

    # 确保归档目录存在
    if not dry_run:
        os.makedirs(archive_dir, exist_ok=True)

    # 遍历月份目录
    for month_dir_name in os.listdir(base_dir):
        month_path = os.path.join(base_dir, month_dir_name)

        if not os.path.isdir(month_path):
            continue

        results["checked"] += 1

        try:
            # 解析月份
            month_date = datetime.strptime(month_dir_name, "%Y-%m")

            # 检查是否早于保留期限
            if month_date < cutoff_date:
                archive_name = f"{month_dir_name}.tar.gz"
                archive_path = os.path.join(archive_dir, archive_name)

                if not dry_run:
                    # 压缩归档
                    shutil.make_archive(
                        os.path.join(archive_dir, month_dir_name),
                        'gztar',
                        month_path
                    )

                    # 删除原目录
                    shutil.rmtree(month_path)

                results["archived"] += 1
                results["details"].append({
                    "month": month_dir_name,
                    "action": "archived",
                    "archive_path": archive_path
                })
            else:
                results["details"].append({
                    "month": month_dir_name,
                    "action": "kept",
                    "reason": "within retention period"
                })

        except Exception as e:
            results["failed"] += 1
            results["details"].append({
                "month": month_dir_name,
                "action": "failed",
                "error": str(e)
            })

    return results

# 使用示例
# results = cleanup_old_tasks(dry_run=True)  # 模拟
# results = cleanup_old_tasks(dry_run=False)  # 实际执行
```

---

## 6. 资源检查

```python
import os
import shutil
import psutil

def check_resources_before_execution(task) -> dict:
    """
    执行前检查系统资源是否充足

    Args:
        task: 任务对象

    Returns:
        {
            "all_passed": bool,
            "checks": dict,
            "warnings": list
        }
    """
    checks = {}
    warnings = []

    # 1. 磁盘空间
    try:
        disk_usage = shutil.disk_usage("/")
        disk_free_mb = disk_usage.free / (1024 * 1024)
        checks["disk_sufficient"] = disk_free_mb > 100  # 100MB

        if disk_free_mb < 500:  # 500MB警告
            warnings.append(f"磁盘空间不足: {disk_free_mb:.1f}MB")
    except:
        checks["disk_sufficient"] = False
        warnings.append("无法检查磁盘空间")

    # 2. 内存
    try:
        memory = psutil.virtual_memory()
        memory_available_mb = memory.available / (1024 * 1024)
        checks["memory_sufficient"] = memory_available_mb > 512  # 512MB

        if memory_available_mb < 1024:  # 1GB警告
            warnings.append(f"可用内存不足: {memory_available_mb:.1f}MB")
    except:
        checks["memory_sufficient"] = True  # 无法检查时假设充足
        warnings.append("无法检查内存")

    # 3. 原子skill数量
    skill_count = len(task.get("atomic_skills", []))
    checks["skill_count_ok"] = skill_count <= 20

    if skill_count > 15:
        warnings.append(f"原子skill数量较多: {skill_count}个")

    # 4. 预估执行时间
    estimated_time = estimate_execution_time(task)
    checks["time_acceptable"] = estimated_time < 14400  # 4小时

    if estimated_time > 7200:  # 2小时警告
        warnings.append(f"预估执行时间较长: {estimated_time/60:.1f}分钟")

    return {
        "all_passed": all(checks.values()),
        "checks": checks,
        "warnings": warnings
    }

def estimate_execution_time(task) -> float:
    """
    预估任务执行时间（秒）
    """
    # 简单估算：每个原子skill平均30秒
    skill_count = len(task.get("atomic_skills", []))
    base_time = skill_count * 30

    # 复杂度调整
    complexity = task.get("complexity_score", 3)
    adjusted_time = base_time * (1 + complexity / 10)

    # 重试预留时间
    retry_buffer = base_time * 0.3

    return adjusted_time + retry_buffer
```

---

## 7. 读写任务文件

```python
import yaml
import json
from typing import Dict, Any

def read_task_file(file_path: str) -> Dict[str, Any]:
    """
    读取任务文件（支持YAML frontmatter + Markdown）
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 解析YAML frontmatter
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            frontmatter = yaml.safe_load(parts[1])
            body = parts[2].strip()

            return {
                "metadata": frontmatter,
                "content": body,
                "raw": content
            }

    # 无frontmatter，返回原始内容
    return {
        "metadata": {},
        "content": content,
        "raw": content
    }

def write_task_file(file_path: str, metadata: Dict, content: str):
    """
    写入任务文件（YAML frontmatter + Markdown）
    """
    # 生成YAML frontmatter
    frontmatter = yaml.dump(metadata, allow_unicode=True, default_flow_style=False)

    # 组合内容
    full_content = f"---\n{frontmatter}---\n\n{content}"

    # 原子写入
    atomic_write(file_path, full_content)
```

---

## 8. 并行执行协调

```python
from threading import Thread, Lock
from queue import Queue
import time

class ParallelSkillExecutor:
    """
    并行原子skill执行器
    """
    def __init__(self, max_workers: int = 2):
        self.max_workers = max_workers
        self.lock = Lock()
        self.results_queue = Queue()

    def execute_parallel(self, skills: list, task_file: str):
        """
        并行执行多个原子skill

        Args:
            skills: 可并行执行的skill列表
            task_file: 任务文件路径
        """
        threads = []

        for skill in skills[:self.max_workers]:  # 限制并发数
            thread = Thread(
                target=self._execute_skill,
                args=(skill, task_file)
            )
            thread.start()
            threads.append(thread)

        # 等待所有线程完成
        for thread in threads:
            thread.join()

        # 收集结果
        results = []
        while not self.results_queue.empty():
            results.append(self.results_queue.get())

        return results

    def _execute_skill(self, skill: dict, task_file: str):
        """
        执行单个skill（线程函数）
        """
        try:
            # 执行skill
            result = execute_atomic_skill(skill)

            # 获取锁写入状态
            with self.lock:
                update_skill_status(
                    task_file,
                    skill["name"],
                    "completed" if result.success else "failed",
                    result.output
                )

            # 将结果放入队列
            self.results_queue.put({
                "skill": skill["name"],
                "success": result.success,
                "output": result.output
            })

        except Exception as e:
            with self.lock:
                update_skill_status(
                    task_file,
                    skill["name"],
                    "failed",
                    str(e)
                )

            self.results_queue.put({
                "skill": skill["name"],
                "success": False,
                "error": str(e)
            })

# 使用示例
# executor = ParallelSkillExecutor(max_workers=2)
# results = executor.execute_parallel(parallel_skills, "tasks/current/task_skill.md")
```

---

## 9. 时间处理工具

```python
from datetime import datetime, timezone, timedelta
import time

class TimeUtils:
    """
    时间处理工具类
    """

    @staticmethod
    def get_current_timestamp() -> str:
        """
        获取当前时间戳字符串
        格式: YYYY-MM-DD HH:MM:SS
        """
        tz = timezone(timedelta(hours=8))  # 东八区
        return datetime.now(tz).strftime("%Y-%m-%d %H:%M:%S")

    @staticmethod
    def get_archive_month() -> str:
        """
        获取归档月份
        格式: YYYY-MM
        """
        tz = timezone(timedelta(hours=8))
        return datetime.now(tz).strftime("%Y-%m")

    @staticmethod
    def parse_datetime(dt_string: str) -> datetime:
        """
        解析时间字符串
        支持格式: YYYY-MM-DD HH:MM:SS
        """
        return datetime.strptime(dt_string, "%Y-%m-%d %H:%M:%S")

    @staticmethod
    def calculate_duration(start_time: str, end_time: str) -> str:
        """
        计算时长
        返回: HH:MM:SS 格式
        """
        start = TimeUtils.parse_datetime(start_time)
        end = TimeUtils.parse_datetime(end_time)
        duration = end - start

        hours = int(duration.total_seconds() // 3600)
        minutes = int((duration.total_seconds() % 3600) // 60)
        seconds = int(duration.total_seconds() % 60)

        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

# 使用示例
# timestamp = TimeUtils.get_current_timestamp()
# archive_month = TimeUtils.get_archive_month()
# duration = TimeUtils.calculate_duration("2026-04-07 14:30:00", "2026-04-07 15:45:30")
```

---

---

## 10. 流式输出（Streaming Output）

> 流式输出为主动通知机制，在任务执行过程中实时向用户展示进度，用户无需等待所有步骤完成才能看到反馈。适用于耗时较长的多步骤任务。

### 10.1 核心设计原则

```
【设计原则】
1. 即时反馈：每个原子skill开始/完成时立即输出，不积累
2. 可视化进度：进度条 + 百分比 + 剩余数量
3. 语义丰富：每条输出包含状态、阶段、耗时、提示
4. 非阻塞：输出不影响主执行流程
5. 可配置：可启用/禁用，控制详细程度
```

### 10.2 输出消息类型

```python
class StreamLevel:
    """
    流式输出级别定义
    """
    # 核心级别（始终显示）
    TASK_START   = "🚀"  # 任务开始
    SKILL_START  = "⚡"  # 原子skill开始
    SKILL_SUCCESS = "✅"  # 原子skill成功
    SKILL_FAIL    = "❌"  # 原子skill失败
    TASK_SUMMARY = "📋"  # 任务总结

    # 辅助级别（可配置）
    PROGRESS_BAR  = "▓"   # 进度条
    TIME_ESTIMATE = "⏱"  # 预计剩余时间
    RETRY         = "🔁"  # 重试中
    WARNING       = "⚠️"  # 警告
    COMPLEXITY     = "🎯"  # 复杂度提示
    VALIDATION    = "🔍"  # 校验中
    REFLECTION    = "💭"  # 反思重规划
    ARCHIVE       = "📦"  # 归档中
```

### 10.3 StreamOutput 类

```python
import sys
import time
import threading
from datetime import datetime
from typing import Optional, List

class StreamOutput:
    """
    流式输出控制器

    功能：
    - 实时输出任务执行进度
    - 彩色终端输出（进度条、状态图标）
    - 写入任务文件执行日志
    - 支持启用/禁用、详细程度控制
    """

    # ANSI 颜色码
    COLORS = {
        "reset": "\033[0m",
        "red": "\033[91m",
        "green": "\033[92m",
        "yellow": "\033[93m",
        "blue": "\033[94m",
        "cyan": "\033[96m",
        "magenta": "\033[95m",
        "white": "\033[97m",
        "gray": "\033[90m",
    }

    # 级别到颜色的映射
    LEVEL_COLORS = {
        "TASK_START": "cyan",
        "SKILL_START": "blue",
        "SKILL_SUCCESS": "green",
        "SKILL_FAIL": "red",
        "SKILL_RETRY": "yellow",
        "WARNING": "yellow",
        "PROGRESS": "cyan",
        "SUMMARY": "magenta",
        "TIME": "gray",
        "VALIDATION": "blue",
        "REFLECTION": "yellow",
        "ARCHIVE": "gray",
        "COMPLEXITY": "magenta",
    }

    def __init__(self,
                 enabled: bool = True,
                 show_progress_bar: bool = True,
                 show_time_estimate: bool = True,
                 show_confidence: bool = True,
                 color_output: bool = True,
                 task_file: str = None):
        """
        初始化流式输出器

        Args:
            enabled: 是否启用流式输出
            show_progress_bar: 是否显示进度条
            show_time_estimate: 是否显示预计剩余时间
            show_confidence: 是否显示意图识别置信度
            color_output: 是否使用彩色输出（False时所有输出为白色）
            task_file: 任务文件路径（用于写入执行日志）
        """
        self.enabled = enabled
        self.show_progress_bar = show_progress_bar
        self.show_time_estimate = show_time_estimate
        self.show_confidence = show_confidence
        self.color_output = color_output
        self.task_file = task_file

        self._task_start_time = None
        self._skill_start_times = {}
        self._lock = threading.Lock()

    def _colorize(self, text: str, color: str) -> str:
        """为文本添加颜色"""
        if not self.color_output or color not in self.COLORS:
            return text
        return f"{self.COLORS[color]}{text}{self.COLORS['reset']}"

    def _print(self, level: str, message: str):
        """线程安全的打印输出"""
        color = self.LEVEL_COLORS.get(level, "white")
        colored_msg = self._colorize(message, color)
        with self._lock:
            print(colored_msg, flush=True)

    def _write_log(self, entry: str):
        """写入任务文件执行日志"""
        if not self.task_file:
            return
        try:
            with open(self.task_file, 'a', encoding='utf-8') as f:
                f.write(entry + "\n")
                f.flush()
        except Exception:
            pass  # 静默处理写入错误，不影响主流程

    def _get_duration(self, start_time: float) -> str:
        """获取耗时字符串"""
        elapsed = time.time() - start_time
        if elapsed < 60:
            return f"{elapsed:.1f}秒"
        elif elapsed < 3600:
            return f"{elapsed/60:.1f}分钟"
        else:
            return f"{elapsed/3600:.1f}小时"

    def _estimate_remaining(self, completed: int, total: int, elapsed: float) -> str:
        """估算剩余时间"""
        if completed == 0:
            return "未知"
        avg_time_per_skill = elapsed / completed
        remaining_skills = total - completed
        remaining_seconds = avg_time_per_skill * remaining_skills
        if remaining_seconds < 60:
            return f"约{remaining_seconds:.0f}秒"
        elif remaining_seconds < 3600:
            return f"约{remaining_seconds/60:.1f}分钟"
        else:
            return f"约{remaining_seconds/3600:.1f}小时"

    # ========== 公开方法 ==========

    def task_start(self,
                  task_id: str,
                  main_skill: str,
                  total_skills: int,
                  intent_summary: str = None,
                  complexity_score: int = None,
                  confidence: float = None):
        """
        输出任务开始信息

        Args:
            task_id: 任务ID
            main_skill: 主skill名称
            total_skills: 总原子skill数量
            intent_summary: 意图摘要（可选）
            complexity_score: 复杂度分数（可选）
            confidence: LLM意图识别置信度（可选）
        """
        if not self.enabled:
            return

        self._task_start_time = time.time()

        lines = []
        lines.append("")
        lines.append(self._colorize(f"🚀 任务开始 | {task_id}", "cyan"))
        lines.append(f"   主技能: {main_skill}")
        lines.append(f"   原子技能: 共{total_skills}个")

        if intent_summary:
            lines.append(f"   意图: {intent_summary[:60]}...")

        if complexity_score is not None:
            complexity_text = self._get_complexity_text(complexity_score)
            lines.append(f"   复杂度: {complexity_text} (score={complexity_score}/10)")

        if confidence is not None and self.show_confidence:
            confidence_text = "高" if confidence >= 0.8 else "中" if confidence >= 0.6 else "低"
            conf_color = "green" if confidence >= 0.8 else "yellow" if confidence >= 0.6 else "red"
            lines.append(self._colorize(f"   意图置信度: {confidence_text} ({confidence:.0%})", conf_color))

        lines.append("─" * 50)

        for line in lines:
            self._print("TASK_START", line)

        self._write_log(f"[{self._timestamp()}] 🚀 任务开始: {task_id}, 主技能: {main_skill}, 共{total_skills}个原子技能")

    def _get_complexity_text(self, score: int) -> str:
        """根据复杂度分数返回文字描述"""
        if score <= 3:
            return "🟢 简单"
        elif score <= 6:
            return "🟡 一般"
        elif score <= 8:
            return "🟠 复杂"
        else:
            return "🔴 非常复杂"

    def skill_start(self,
                   skill_name: str,
                   skill_index: int,
                   total_skills: int,
                   skill_desc: str = None,
                   parallel_group: int = None):
        """
        输出原子skill开始执行信息

        Args:
            skill_name: 技能名称
            skill_index: 当前索引（从1开始）
            total_skills: 总技能数
            skill_desc: 技能描述（可选）
            parallel_group: 并行组编号（可选，None表示顺序执行）
        """
        if not self.enabled:
            return

        self._skill_start_times[skill_name] = time.time()

        # 计算进度
        progress = skill_index / total_skills
        bar_length = 20
        filled = int(bar_length * progress)
        bar = "▓" * filled + "░" * (bar_length - filled)
        percent = int(progress * 100)

        # 构建消息
        parallel_hint = f" [并行组{parallel_group}]" if parallel_group else ""
        lines = []
        lines.append("")
        lines.append(
            f"⚡ 执行 {skill_index}/{total_skills} {parallel_hint}"
        )
        lines.append(f"   技能: {skill_name}")
        if skill_desc:
            lines.append(f"   描述: {skill_desc[:50]}{'...' if len(skill_desc) > 50 else ''}")

        if self.show_progress_bar:
            lines.append(
                f"   进度: [{bar}] {percent}% "
                f"(剩余 {total_skills - skill_index} 个)"
            )

        for line in lines:
            self._print("SKILL_START", line)

        self._write_log(
            f"[{self._timestamp()}] ⚡ 开始执行: {skill_name} ({skill_index}/{total_skills})"
        )

    def skill_success(self,
                      skill_name: str,
                      skill_index: int,
                      total_skills: int,
                      result_summary: str = None,
                      elapsed: float = None):
        """
        输出原子skill成功完成信息

        Args:
            skill_name: 技能名称
            skill_index: 当前索引（从1开始）
            total_skills: 总技能数
            result_summary: 执行结果摘要（可选）
            elapsed: 执行耗时（秒）
        """
        if not self.enabled:
            return

        duration_str = self._get_duration(self._skill_start_times.pop(skill_name, time.time())) if elapsed is None else self._get_duration(elapsed)

        remaining = total_skills - skill_index
        lines = []
        lines.append("")
        lines.append(
            self._colorize(f"✅ {skill_name} 完成", "green")
        )
        if result_summary:
            # 截取结果摘要
            result_short = result_summary[:80] + "..." if len(result_summary) > 80 else result_summary
            lines.append(f"   结果: {result_short}")
        lines.append(
            self._colorize(f"   耗时: {duration_str} | 剩余: {remaining} 个技能", "green")
        )

        for line in lines:
            self._print("SKILL_SUCCESS", line)

        self._write_log(
            f"[{self._timestamp()}] ✅ {skill_name} 完成，耗时: {duration_str}"
        )

    def skill_fail(self,
                   skill_name: str,
                   error_msg: str,
                   will_retry: bool = False,
                   retry_count: int = 0,
                   max_retries: int = 3):
        """
        输出原子skill失败信息

        Args:
            skill_name: 技能名称
            error_msg: 错误信息
            will_retry: 是否会重试
            retry_count: 当前重试次数
            max_retries: 最大重试次数
        """
        if not self.enabled:
            return

        lines = []
        lines.append("")
        if will_retry:
            lines.append(
                self._colorize(
                    f"⚠️ {skill_name} 失败（第{retry_count}/{max_retries}次重试）",
                    "yellow"
                )
            )
        else:
            lines.append(
                self._colorize(f"❌ {skill_name} 失败", "red")
            )
        lines.append(
            self._colorize(f"   错误: {error_msg[:100]}", "red")
        )

        for line in lines:
            self._print("SKILL_FAIL", line)

        self._write_log(
            f"[{self._timestamp()}] ❌ {skill_name} 失败: {error_msg}"
        )

    def validation_progress(self, current: int, total: int, check_name: str = None):
        """
        输出校验进度

        Args:
            current: 当前校验项
            total: 总校验项
            check_name: 校验项名称（可选）
        """
        if not self.enabled:
            return

        check_hint = f" - {check_name}" if check_name else ""
        msg = f"🔍 校验进度: {current}/{total}{check_hint}"
        self._print("VALIDATION", msg)

    def validation_result(self, passed: bool, check_name: str, details: str = None):
        """
        输出单项校验结果

        Args:
            passed: 是否通过
            check_name: 校验项名称
            details: 详情（可选）
        """
        if not self.enabled:
            return

        status = self._colorize("✅ 通过", "green") if passed else self._colorize("❌ 未通过", "red")
        msg = f"   {status}: {check_name}"
        if details:
            msg += f" ({details})"
        self._print("VALIDATION", msg)

    def reflection_progress(self, attempt: int, max_attempts: int, issue: str = None):
        """
        输出反思重规划进度

        Args:
            attempt: 当前反思次数
            max_attempts: 最大反思次数
            issue: 问题描述（可选）
        """
        if not self.enabled:
            return

        lines = []
        lines.append("")
        lines.append(
            self._colorize(f"💭 反思重规划 ({attempt}/{max_attempts})", "yellow")
        )
        if issue:
            lines.append(f"   问题: {issue[:60]}...")
        for line in lines:
            self._print("REFLECTION", line)

    def task_summary(self,
                    task_id: str,
                    total_skills: int,
                    success_count: int,
                    fail_count: int,
                    skip_count: int,
                    total_elapsed: float,
                    main_skill: str,
                    goal_achieved: bool = True):
        """
        输出任务总结信息

        Args:
            task_id: 任务ID
            total_skills: 总技能数
            success_count: 成功数
            fail_count: 失败数
            skip_count: 跳过数
            total_elapsed: 总耗时（秒）
            main_skill: 主skill名称
            goal_achieved: 目标是否达成
        """
        if not self.enabled:
            return

        duration = self._get_duration(self._task_start_time) if self._task_start_time else self._get_duration(total_elapsed)

        lines = []
        lines.append("")
        lines.append("─" * 50)

        if goal_achieved:
            lines.append(
                self._colorize(f"✅ 任务完成 | {task_id} | {main_skill}", "green")
            )
        else:
            lines.append(
                self._colorize(f"⚠️ 任务部分完成 | {task_id} | {main_skill}", "yellow")
            )

        lines.append(f"   总耗时: {duration}")
        lines.append(f"   技能执行: {success_count}成功 / {fail_count}失败 / {skip_count}跳过")

        # 成功率
        success_rate = success_count / total_skills if total_skills > 0 else 0
        rate_color = "green" if success_rate >= 0.8 else "yellow" if success_rate >= 0.5 else "red"
        lines.append(
            self._colorize(f"   成功率: {success_rate:.0%}", rate_color)
        )

        if not goal_achieved:
            lines.append(
                self._colorize("   提示: 目标未完全达成，请查看执行日志了解详情", "yellow")
            )

        lines.append("─" * 50)

        for line in lines:
            self._print("TASK_SUMMARY", line)

        self._write_log(
            f"[{self._timestamp()}] 📋 任务{'完成' if goal_achieved else '部分完成'}: "
            f"{task_id}, 耗时: {duration}, "
            f"成功: {success_count}, 失败: {fail_count}, 跳过: {skip_count}"
        )

    def _timestamp(self) -> str:
        """获取当前时间戳字符串"""
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def disable(self):
        """临时禁用流式输出"""
        self.enabled = False

    def enable(self):
        """启用流式输出"""
        self.enabled = True
```

### 10.4 集成到原子skill执行流程

```python
# 在 TaskExecutor 或 Reasoner 中集成 StreamOutput

class TaskExecutor:
    def __init__(self, task_file: str = None, stream_enabled: bool = True):
        # ... 其他初始化 ...
        self.stream = StreamOutput(
            enabled=stream_enabled,
            show_progress_bar=True,
            show_time_estimate=True,
            show_confidence=True,
            task_file=task_file
        )

    def execute_atomic_skill(self, skill_name: str, skill_index: int,
                            total_skills: int, **kwargs):
        """
        执行单个原子skill（含流式输出）
        """
        # 1. 开始执行 - 流式输出
        self.stream.skill_start(
            skill_name=skill_name,
            skill_index=skill_index,
            total_skills=total_skills,
            skill_desc=kwargs.get("desc", ""),
            parallel_group=kwargs.get("parallel_group")
        )

        # 2. 执行技能（原有逻辑）
        start_time = time.time()
        try:
            result = self._do_execute_skill(skill_name, **kwargs)
            elapsed = time.time() - start_time

            # 3. 成功 - 流式输出
            self.stream.skill_success(
                skill_name=skill_name,
                skill_index=skill_index,
                total_skills=total_skills,
                result_summary=result.get("summary", ""),
                elapsed=elapsed
            )

            return {"status": "success", "result": result}

        except Exception as e:
            # 4. 失败 - 流式输出
            self.stream.skill_fail(
                skill_name=skill_name,
                error_msg=str(e)[:100],
                will_retry=kwargs.get("retry_count", 0) < 3,
                retry_count=kwargs.get("retry_count", 0),
                max_retries=3
            )
            return {"status": "failed", "error": str(e)}

    def execute_task(self, intent: dict, main_skill: str,
                    atomic_skills: list, task_id: str):
        """
        执行完整任务（含流式输出）
        """
        total = len(atomic_skills)

        # 任务开始 - 流式输出
        self.stream.task_start(
            task_id=task_id,
            main_skill=main_skill,
            total_skills=total,
            intent_summary=intent.get("original_input", "")[:60],
            complexity_score=intent.get("complexity_score"),
            confidence=intent.get("confidence", {}).get("overall")
        )

        # 执行每个原子skill
        success_count = fail_count = skip_count = 0
        for i, skill in enumerate(atomic_skills, 1):
            result = self.execute_atomic_skill(
                skill_name=skill["name"],
                skill_index=i,
                total_skills=total,
                desc=skill.get("desc", "")
            )

            if result["status"] == "success":
                success_count += 1
            elif result["status"] == "failed":
                fail_count += 1
            else:
                skip_count += 1

        # 任务总结 - 流式输出
        self.stream.task_summary(
            task_id=task_id,
            total_skills=total,
            success_count=success_count,
            fail_count=fail_count,
            skip_count=skip_count,
            total_elapsed=time.time(),
            main_skill=main_skill,
            goal_achieved=fail_count == 0
        )
```

### 10.5 与 task_skill.md 的集成

流式输出同时写入终端和任务文件：

```
tasks/current/task_skill.md
├── 执行日记（追加流式输出）
│   ├── [14:30:01] 🚀 任务开始: 20260521_123456, 主技能: bug-solver, 共6个原子技能
│   ├── [14:30:02] ⚡ 开始执行: bug-identification (1/6)
│   ├── [14:30:05] ✅ bug-identification 完成，耗时: 3.2秒
│   ├── [14:30:05] ⚡ 开始执行: code-analysis (2/6)
│   ├── [14:30:18] ✅ code-analysis 完成，耗时: 13.1秒
│   ├── [14:30:18] ⚡ 开始执行: root-cause-analysis (3/6)
│   ├── [14:30:32] ✅ root-cause-analysis 完成，耗时: 14.3秒
│   ...
│   └── [14:32:15] 📋 任务完成: 20260521_123456, 耗时: 2分14秒, 成功: 6, 失败: 0
└── ...
```

---

**版本**: 1.0
**最后更新**: 2026-05-21
**依赖**: Python 3.8+（标准库，无需额外依赖）
**特性**：
- 线程安全（threading.Lock）
- 无彩色转义码时自动降级为纯文本
- 写入失败不影响主执行流程

---

## 11. Token 消耗追踪

### 11.1 核心设计原则

```
【设计原则】
1. 主动监控：每次 LLM 调用后记录 token 消耗
2. 预算管理：支持任务级和会话级预算控制
3. 分层统计：会话总计 / 任务总计 / 单技能统计
4. 预警机制：接近预算时主动提示用户
5. 成本透明：支持自定义费率，实时计算成本
```

### 11.2 TokenTracker 类

```python
import time
from typing import Optional, List, Dict, Any

class TokenTracker:
    """
    Token 消耗追踪器

    功能：
    - 记录每次 LLM 调用的 token 消耗
    - 按任务和技能分层统计
    - 预算管理和预警
    - 支持自定义费率计算成本

    使用场景：
    | 场景 | enabled | color_output | write_to_task_file |
    |------|---------|-------------|-------------------|
    | 正常执行（完整输出）| True | True | True |
    | CI/自动化环境（纯日志）| True | False | True |
    | 调试模式（仅终端）| True | True | False |
    | 静默模式（无输出）| False | - | False |
    """

    def __init__(self,
                 session_budget: int = 1000000,    # 会话级总预算（token）
                 task_budget: int = 200000,        # 任务级预算（token）
                 warning_threshold: float = 0.8,   # 预警阈值 80%
                 input_cost_per_1k: float = 3.0,   # $3/百万输入token
                 output_cost_per_1k: float = 15.0, # $15/百万输出token
                 task_file: str = None):            # 写入任务文件
        self.session_total = {
            "input_tokens": 0, "output_tokens": 0,
            "total_tokens": 0, "total_cost": 0.0, "call_count": 0
        }
        self.task_total = {
            "input_tokens": 0, "output_tokens": 0,
            "total_tokens": 0, "total_cost": 0.0, "call_count": 0
        }
        self.task_id = None
        self.task_start_time = None
        self.skill_records: List[Dict[str, Any]] = []
        self.session_budget = session_budget
        self.task_budget = task_budget
        self.warning_threshold = warning_threshold
        self.input_cost_per_1k = input_cost_per_1k
        self.output_cost_per_1k = output_cost_per_1k
        self.task_file = task_file
        self._warned_skills = set()

    def start_task(self, task_id: str):
        """开始新任务，重置任务级统计"""
        self.task_id = task_id
        self.task_start_time = time.time()
        self.task_total = {
            "input_tokens": 0, "output_tokens": 0,
            "total_tokens": 0, "total_cost": 0.0, "call_count": 0
        }
        self.skill_records = []
        self._warned_skills = set()

    def record_skill_usage(self,
                          skill_name: str,
                          input_tokens: int,
                          output_tokens: int,
                          model: str = "claude-sonnet-4-20250514",
                          is_intent_recognition: bool = False):
        """
        记录单次 LLM 调用的 token 消耗

        Args:
            skill_name: 技能名称
            input_tokens: 输入 token 数
            output_tokens: 输出 token 数
            model: 模型名称
            is_intent_recognition: 是否为意图识别调用（意图识别单独统计）
        """
        total_tokens = input_tokens + output_tokens
        cost = self._calculate_cost(input_tokens, output_tokens)

        # 更新会话级统计
        self.session_total["input_tokens"] += input_tokens
        self.session_total["output_tokens"] += output_tokens
        self.session_total["total_tokens"] += total_tokens
        self.session_total["total_cost"] += cost
        self.session_total["call_count"] += 1

        # 更新任务级统计
        self.task_total["input_tokens"] += input_tokens
        self.task_total["output_tokens"] += output_tokens
        self.task_total["total_tokens"] += total_tokens
        self.task_total["total_cost"] += cost
        self.task_total["call_count"] += 1

        # 记录到技能列表
        self.skill_records.append({
            "skill_name": skill_name,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": total_tokens,
            "cost": cost,
            "model": model,
            "is_intent_recognition": is_intent_recognition,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        })

        # 写入任务文件（如配置）
        if self.task_file:
            self._write_to_task_file(skill_name, total_tokens, cost)

        # 控制台输出 token 消耗
        self._print_usage(skill_name, input_tokens, output_tokens, cost)

        # 检查是否需要预警
        self._check_warning(skill_name)

    def _calculate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """根据费率计算成本（单位：美元）"""
        return (input_tokens / 1000 * self.input_cost_per_1k +
                output_tokens / 1000 * self.output_cost_per_1k)

    def _print_usage(self, skill_name: str, input_tokens: int,
                     output_tokens: int, cost: float):
        """输出单次 LLM 调用消耗"""
        import sys
        total = input_tokens + output_tokens
        label = "意图识别" if skill_name == "LLM_INTENT_RECOGNITION" else skill_name
        print(f"💰 {label}: +{total:,} token (输入:{input_tokens:,} 输出:{output_tokens:,}), 成本 ${cost:.4f}",
              file=sys.stderr)

    def _write_to_task_file(self, skill_name: str, total_tokens: int, cost: float):
        """写入任务文件记录 token 消耗"""
        try:
            with open(self.task_file, "a", encoding="utf-8") as f:
                f.write(f"[{time.strftime('%H:%M:%S')}] 💰 Token消耗: {skill_name}, "
                        f"+{total_tokens:,} token, 成本 ${cost:.4f}\n")
        except Exception:
            pass  # 写入失败不影响主流程

    def _check_warning(self, skill_name: str):
        """检查是否触发预警"""
        if skill_name in self._warned_skills:
            return

        task_usage_ratio = self.task_total["total_tokens"] / self.task_budget
        session_usage_ratio = self.task_total["total_tokens"] / self.session_budget

        # 取两者中较严格的比例
        usage_ratio = max(task_usage_ratio, session_usage_ratio)

        if usage_ratio >= self.warning_threshold:
            self._warned_skills.add(skill_name)
            self._print_warning(usage_ratio)

    def _print_warning(self, usage_ratio: float):
        """输出预警消息"""
        import sys
        pct = int(usage_ratio * 100)
        print(f"\n⚠️  Token 消耗预警：任务已消耗 {pct}% 预算",
              file=sys.stderr)
        print(f"   已用: {self.task_total['total_tokens']:,} token / "
              f"{self.task_budget:,} token", file=sys.stderr)
        print(f"   预计成本: ${self.task_total['total_cost']:.4f}", file=sys.stderr)
        if usage_ratio >= 0.95:
            print(f"   🚨 接近预算上限，建议检查任务是否需要终止", file=sys.stderr)

    def get_task_summary(self) -> dict:
        """获取任务级 token 消耗摘要"""
        elapsed = time.time() - self.task_start_time if self.task_start_time else 0
        return {
            "task_id": self.task_id,
            "duration_seconds": round(elapsed, 1),
            "total_tokens": self.task_total["total_tokens"],
            "input_tokens": self.task_total["input_tokens"],
            "output_tokens": self.task_total["output_tokens"],
            "total_cost_usd": round(self.task_total["total_cost"], 6),
            "call_count": self.task_total["call_count"],
            "budget_usage_pct": round(
                self.task_total["total_tokens"] / self.task_budget * 100, 1),
            "avg_tokens_per_call": (
                self.task_total["total_tokens"] //
                max(self.task_total["call_count"], 1)
            ),
            "by_skill": [
                {**r, "cost": round(r["cost"], 6)}
                for r in self.skill_records
            ]
        }

    def print_task_summary(self):
        """输出任务级 token 摘要（流式输出集成）"""
        summary = self.get_task_summary()
        print(f"\n💰 Token 消耗摘要（任务 {summary['task_id']}）")
        print(f"   总消耗: {summary['total_tokens']:,} token")
        print(f"   输入: {summary['input_tokens']:,} | 输出: {summary['output_tokens']:,}")
        print(f"   预估成本: ${summary['total_cost_usd']:.4f}")
        print(f"   调用次数: {summary['call_count']} 次，"
              f"平均 {summary['avg_tokens_per_call']:,} token/次")
        print(f"   预算使用: {summary['budget_usage_pct']:.1f}%")
        print(f"   耗时: {summary['duration_seconds']:.1f} 秒")

    def get_session_summary(self) -> dict:
        """获取会话级 token 消耗摘要"""
        return {
            "total_tokens": self.session_total["total_tokens"],
            "input_tokens": self.session_total["input_tokens"],
            "output_tokens": self.session_total["output_tokens"],
            "total_cost_usd": round(self.session_total["total_cost"], 6),
            "call_count": self.session_total["call_count"],
            "budget_usage_pct": round(
                self.session_total["total_tokens"] / self.session_budget * 100, 1),
        }
```

### 11.3 在 LLM 调用处集成 TokenTracker

```python
# 在 LLM 意图识别中集成 token 追踪
def llm_intent_recognition(user_input: str, token_tracker: TokenTracker = None):
    # ... 构造 Prompt 等原有逻辑 ...

    response = client.messages.create(
        model=LLM_INTENT_CONFIG["model"],
        max_tokens=LLM_INTENT_CONFIG["max_tokens"],
        system=INTENT_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
        temperature=LLM_INTENT_CONFIG["temperature"]
    )

    # 从响应中提取 token 使用量（Anthropic API）
    input_tokens = response.usage.input_tokens
    output_tokens = response.usage.output_tokens

    # 记录到追踪器
    if token_tracker:
        token_tracker.record_skill_usage(
            skill_name="LLM_INTENT_RECOGNITION",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            model=LLM_INTENT_CONFIG["model"],
            is_intent_recognition=True
        )

    return parse_intent_response(response)
```

### 11.4 与流式输出的集成

Token 消耗追踪与流式输出可并行工作，互不干扰。在 `task_summary` 流式输出中追加 token 统计：

```
💭 反思重规划 (1/3)
   问题: 输出格式与预期不符
   ↓
📋 任务完成 | 耗时: 2分14秒
   技能执行: 6成功 / 0失败 / 0跳过
   成功率: 100%
   💰 Token: 45,230 token | 预估成本: $0.82 | 预算使用: 22.6%
```

### 11.5 TokenTracker 在 Orchestrator 中的生命周期

```
Orchestrator 主流程:

    token_tracker = TokenTracker(task_budget=200000)  # 初始化
         ↓
    token_tracker.start_task(task_id)                  # 任务开始
         ↓
    for each atomic_skill:                            # 技能执行循环
        skill_result = execute_skill(skill)            # 原有执行逻辑
        if skill_result.llm_call:                     # 如果涉及LLM调用
            token_tracker.record_skill_usage(          # 记录消耗
                skill_name=skill.name,
                input_tokens=response.usage.input_tokens,
                output_tokens=response.usage.output_tokens
            )
         ↓
    token_tracker.print_task_summary()                 # 任务总结时输出统计
         ↓
    token_tracker.get_task_summary() → 写入 task_skill.md 结果文档
```

### 11.6 三层预算体系

| 层级 | 范围 | 默认预算 | 控制粒度 |
|------|------|---------|---------|
| 会话级 | 整个 Claude Code 会话 | 1,000,000 token | 跨任务累积 |
| 任务级 | 单次 Orchestrator 任务 | 200,000 token | 单次任务 |
| 技能级 | 单次 LLM 调用 | 无限制 | 由任务级控制 |

**预警机制**：
- 80% 预算时：普通预警（黄色 ⚠️）
- 95% 预算时：严重警告（红色 🚨）
- 100% 预算时：提示是否终止任务

---

**版本**: 1.1
**最后更新**: 2026-05-21
**依赖**: Python 3.8+（标准库，无需额外依赖）
**特性**：
- 三层统计：会话级 / 任务级 / 技能级
- 实时成本计算，支持多模型费率
- 自动预警，防止超预算
- 与 StreamOutput 并行工作，互不干扰
