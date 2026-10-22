import os

EXCLUDE_DIRS = {'node_modules', 'venv', 'dist', '.git', '__pycache__', '.pytest_cache'}
EXTENSIONS = {'.py', '.tsx', '.ts', '.css', '.html', '.md', '.sql', '.sh', '.bat'}

def count_lines():
    summary = {}
    total_lines = 0
    total_files = 0
    
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            ext = os.path.splitext(f)[1]
            if ext in EXTENSIONS:
                path = os.path.join(root, f)
                try:
                    with open(path, 'r', encoding='utf-8', errors='ignore') as fh:
                        count = sum(1 for _ in fh)
                        summary[ext] = summary.get(ext, 0) + count
                        total_lines += count
                        total_files += 1
                except Exception:
                    pass

    print(f"Total Hand-Authored Files: {total_files}")
    print(f"Total Lines of Code:       {total_lines}")
    print("\nBreakdown by Extension:")
    for ext, count in sorted(summary.items(), key=lambda x: x[1], reverse=True):
        print(f"  {ext:8s}: {count:6d} lines")

if __name__ == '__main__':
    count_lines()
