2025-11-16T14:43:10.531542585Z   Using cached grpcio_status-1.63.2-py3-none-any.whl (14 kB)
2025-11-16T14:43:10.541696955Z   Using cached grpcio_status-1.63.0-py3-none-any.whl (14 kB)
2025-11-16T14:43:10.551750882Z   Using cached grpcio_status-1.62.3-py3-none-any.whl (14 kB)
2025-11-16T14:43:10.877162798Z Installing collected packages: strenum, websockets, urllib3, typing_extensions, tqdm, sniffio, six, python-dotenv, pyasn1, psycopg2-binary, protobuf, packaging, MarkupSafe, itsdangerous, idna, h11, click, charset-normalizer, certifi, cachetools, blinker, annotated-types, Werkzeug, typing-inspection, rsa, requests, python-dateutil, pydantic-core, pyasn1-modules, proto-plus, Jinja2, gunicorn, grpcio, googleapis-common-protos, exceptiongroup, deprecation, asgiref, realtime, pydantic, grpcio-status, google-auth, Flask, anyio, openfoodfacts, httpcore, google-api-core, Flask-CORS, httpx, supafunc, storage3, postgrest, gotrue, google-ai-generativelanguage, supabase, google-generativeai
2025-11-16T14:43:22.864122578Z Successfully installed Flask-2.3.3 Flask-CORS-4.0.0 Jinja2-3.1.6 MarkupSafe-3.0.3 Werkzeug-3.1.3 annotated-types-0.7.0 anyio-4.11.0 asgiref-3.10.0 blinker-1.9.0 cachetools-6.2.2 certifi-2025.11.12 charset-normalizer-3.4.4 click-8.3.1 deprecation-2.1.0 exceptiongroup-1.3.0 google-ai-generativelanguage-0.4.0 google-api-core-2.28.1 google-auth-2.43.0 google-generativeai-0.3.1 googleapis-common-protos-1.72.0 gotrue-1.3.1 grpcio-1.76.0 grpcio-status-1.62.3 gunicorn-21.2.0 h11-0.14.0 httpcore-0.17.3 httpx-0.24.1 idna-3.11 itsdangerous-2.2.0 openfoodfacts-3.1.0 packaging-25.0 postgrest-0.10.8 proto-plus-1.26.1 protobuf-4.25.8 psycopg2-binary-2.9.7 pyasn1-0.6.1 pyasn1-modules-0.4.2 pydantic-2.12.4 pydantic-core-2.41.5 python-dateutil-2.9.0.post0 python-dotenv-1.0.0 realtime-1.0.6 requests-2.31.0 rsa-4.9.1 six-1.17.0 sniffio-1.3.1 storage3-0.5.4 strenum-0.4.15 supabase-1.0.4 supafunc-0.2.3 tqdm-4.67.1 typing-inspection-0.4.2 typing_extensions-4.15.0 urllib3-2.5.0 websockets-12.0
2025-11-16T14:43:22.935434325Z 
2025-11-16T14:43:22.935453196Z [notice] A new release of pip available: 22.3.1 -> 25.3
2025-11-16T14:43:22.935456946Z [notice] To update, run: pip install --upgrade pip
2025-11-16T14:43:25.486339224Z ==> Uploading build...
2025-11-16T14:43:40.915186691Z ==> Uploaded in 11.1s. Compression took 4.4s
2025-11-16T14:43:40.987481098Z ==> Build successful 🎉
2025-11-16T14:43:42.928261123Z ==> Deploying...
2025-11-16T14:44:25.861205881Z ModuleNotFoundError: No module named 'cv2'
2025-11-16T14:44:45.651669358Z ==> Exited with status 1
2025-11-16T14:44:45.665902126Z ==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys
2025-11-16T14:44:52.833937684Z ==> Running 'gunicorn api.app:app'
2025-11-16T14:45:00.335861824Z Traceback (most recent call last):
2025-11-16T14:45:00.335890776Z   File "/opt/render/project/src/.venv/bin/gunicorn", line 8, in <module>
2025-11-16T14:45:00.335897456Z     sys.exit(run())
2025-11-16T14:45:00.335902936Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/wsgiapp.py", line 67, in run
2025-11-16T14:45:00.335909427Z     WSGIApplication("%(prog)s [OPTIONS] [APP_MODULE]").run()
2025-11-16T14:45:00.335913867Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/base.py", line 236, in run
2025-11-16T14:45:00.335918207Z     super().run()
2025-11-16T14:45:00.335934698Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/base.py", line 72, in run
2025-11-16T14:45:00.335939169Z     Arbiter(self).run()
2025-11-16T14:45:00.335943219Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/arbiter.py", line 58, in __init__
2025-11-16T14:45:00.335947369Z     self.setup(app)
2025-11-16T14:45:00.335951779Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/arbiter.py", line 118, in setup
2025-11-16T14:45:00.335955829Z     self.app.wsgi()
2025-11-16T14:45:00.3359598Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/base.py", line 67, in wsgi
2025-11-16T14:45:00.3359644Z     self.callable = self.load()
2025-11-16T14:45:00.33596841Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/wsgiapp.py", line 58, in load
2025-11-16T14:45:00.3359725Z     return self.load_wsgiapp()
2025-11-16T14:45:00.335977451Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/wsgiapp.py", line 48, in load_wsgiapp
2025-11-16T14:45:00.335981461Z     return util.import_app(self.app_uri)
2025-11-16T14:45:00.335985431Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/util.py", line 371, in import_app
2025-11-16T14:45:00.335989531Z     mod = importlib.import_module(module)
2025-11-16T14:45:00.335993392Z   File "/opt/render/project/python/Python-3.10.10/lib/python3.10/importlib/__init__.py", line 126, in import_module
2025-11-16T14:45:00.335997322Z     return _bootstrap._gcd_import(name[level:], package, level)
2025-11-16T14:45:00.336001412Z   File "<frozen importlib._bootstrap>", line 1050, in _gcd_import
2025-11-16T14:45:00.336006062Z   File "<frozen importlib._bootstrap>", line 1027, in _find_and_load
2025-11-16T14:45:00.336010213Z   File "<frozen importlib._bootstrap>", line 1006, in _find_and_load_unlocked
2025-11-16T14:45:00.336014193Z   File "<frozen importlib._bootstrap>", line 688, in _load_unlocked
2025-11-16T14:45:00.336018043Z   File "<frozen importlib._bootstrap_external>", line 883, in exec_module
2025-11-16T14:45:00.336021873Z   File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
2025-11-16T14:45:00.336025723Z   File "/opt/render/project/src/backend/api/app.py", line 24, in <module>
2025-11-16T14:45:00.336029924Z     from .utils.expiry_logic import set_supabase_client_for_categories
2025-11-16T14:45:00.336034304Z   File "/opt/render/project/src/backend/api/utils/expiry_logic.py", line 1, in <module>
2025-11-16T14:45:00.336038314Z     import cv2
2025-11-16T14:45:00.336042304Z ModuleNotFoundError: No module named 'cv2'