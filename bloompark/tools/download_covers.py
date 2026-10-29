"""Optional: Save original VR covers from booooand.com into ./assets/covers.
Run once on an Internet-connected computer: python tools/download_covers.py
Only uses Python standard library. Will update cover URLs in data.js and projects.json.
"""
from pathlib import Path
from urllib.request import urlopen, Request
import json, time

root=Path(__file__).resolve().parent.parent
path=root/'projects.json'
projects=json.loads(path.read_text(encoding='utf-8'))
output=root/'assets'/'covers'
output.mkdir(parents=True,exist_ok=True)
changed=0
for project in projects:
    url=project['cover']
    if not url.startswith('http'):
        print('Already local',project['name']); continue
    extension=Path(url.split('?')[0]).suffix.lower()
    if extension not in ('.jpg','.jpeg','.png','.webp'): extension='.jpg'
    file=output/(project['id']+extension)
    try:
        req=Request(url,headers={'User-Agent':'Mozilla/5.0 (BLOOMPARK Cover Archive; direct owner use)','Referer':'https://booooand.com/'})
        with urlopen(req,timeout=22) as response:
            content_type=response.headers.get('Content-Type','')
            if not content_type.startswith('image/'):
                raise ValueError('Unexpected Content-Type: '+content_type)
            body=response.read(18*1024*1024)
            if len(body)<2000:raise ValueError('Image is unexpectedly small')
        file.write_bytes(body)
        project['cover']='assets/covers/'+file.name
        changed+=1
        print('Downloaded',project['name'],len(body),'bytes')
    except Exception as exc:print('Failed',project['name'],str(exc))
    time.sleep(.15)
if changed:
    path.write_text(json.dumps(projects,ensure_ascii=False,indent=2),encoding='utf-8')
    (root/'data.js').write_text('// Original VR projects & links, with locally saved covers\nwindow.BLOOMPARK_PROJECTS = '+json.dumps(projects,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print('Saved',changed,'images. Open index.html or deploy entire folder.')
