import os
import re

def build_static():
    files = ['index.html', 'login.html', 'signup.html', 'staff.html']
    
    for filename in files:
        src = os.path.join('templates', filename)
        if not os.path.exists(src):
            continue
            
        with open(src, 'r') as f:
            content = f.read()
            
        # Replace absolute static paths with relative
        content = content.replace('href="/static/', 'href="./static/')
        content = content.replace('src="/static/', 'src="./static/')
        
        # Replace routing paths with .html files
        content = content.replace('href="/login"', 'href="./login.html"')
        content = content.replace('href="/staff"', 'href="./staff.html"')
        content = content.replace('href="/signup"', 'href="./signup.html"')
        content = content.replace('href="/"', 'href="./index.html"')
        content = content.replace("window.location.href = '/'", "window.location.href = './index.html'")
        
        with open(filename, 'w') as f:
            f.write(content)

if __name__ == '__main__':
    build_static()
