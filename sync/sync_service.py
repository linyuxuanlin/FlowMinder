import os
import threading
import argparse
from file_watcher import start_watching

def main():
    parser = argparse.ArgumentParser(description='FlowMinder 同步服务')
    parser.add_argument('--api_url', type=str, default='http://localhost:8000', 
                        help='FlowMinder API URL (default: http://localhost:8000)')
    parser.add_argument('--dir', type=str, default='.',
                        help='要监控的目录 (default: current directory)')
    
    args = parser.parse_args()
    
    # 打印启动信息
    print("="*50)
    print("FlowMinder 同步服务启动")
    print(f"API URL: {args.api_url}")
    print(f"监控目录: {os.path.abspath(args.dir)}")
    print("="*50)
    
    # 启动监控线程
    watch_thread = threading.Thread(
        target=start_watching,
        args=(args.dir, args.api_url),
        daemon=True
    )
    watch_thread.start()
    
    try:
        # 保持主线程运行
        watch_thread.join()
    except KeyboardInterrupt:
        print("\n同步服务正在关闭...")

if __name__ == "__main__":
    main() 