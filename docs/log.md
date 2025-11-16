2025-11-16T14:48:41.981004769Z Installing collected packages: strenum, websockets, urllib3, typing_extensions, tqdm, sniffio, six, python-dotenv, pyasn1, psycopg2-binary, protobuf, packaging, MarkupSafe, itsdangerous, idna, h11, click, charset-normalizer, certifi, cachetools, blinker, annotated-types, Werkzeug, typing-inspection, rsa, requests, python-dateutil, pydantic-core, pyasn1-modules, proto-plus, Jinja2, gunicorn, grpcio, googleapis-common-protos, exceptiongroup, deprecation, asgiref, realtime, pydantic, grpcio-status, google-auth, Flask, anyio, openfoodfacts, httpcore, google-api-core, Flask-CORS, httpx, supafunc, storage3, postgrest, gotrue, google-ai-generativelanguage, supabase, google-generativeai
2025-11-16T14:48:47.400339458Z Successfully installed Flask-2.3.3 Flask-CORS-4.0.0 Jinja2-3.1.6 MarkupSafe-3.0.3 Werkzeug-3.1.3 annotated-types-0.7.0 anyio-4.11.0 asgiref-3.10.0 blinker-1.9.0 cachetools-6.2.2 certifi-2025.11.12 charset-normalizer-3.4.4 click-8.3.1 deprecation-2.1.0 exceptiongroup-1.3.0 google-ai-generativelanguage-0.4.0 google-api-core-2.28.1 google-auth-2.43.0 google-generativeai-0.3.1 googleapis-common-protos-1.72.0 gotrue-1.3.1 grpcio-1.76.0 grpcio-status-1.62.3 gunicorn-21.2.0 h11-0.14.0 httpcore-0.17.3 httpx-0.24.1 idna-3.11 itsdangerous-2.2.0 openfoodfacts-3.1.0 packaging-25.0 postgrest-0.10.8 proto-plus-1.26.1 protobuf-4.25.8 psycopg2-binary-2.9.7 pyasn1-0.6.1 pyasn1-modules-0.4.2 pydantic-2.12.4 pydantic-core-2.41.5 python-dateutil-2.9.0.post0 python-dotenv-1.0.0 realtime-1.0.6 requests-2.31.0 rsa-4.9.1 six-1.17.0 sniffio-1.3.1 storage3-0.5.4 strenum-0.4.15 supabase-1.0.4 supafunc-0.2.3 tqdm-4.67.1 typing-inspection-0.4.2 typing_extensions-4.15.0 urllib3-2.5.0 websockets-12.0
2025-11-16T14:48:47.459242337Z 
2025-11-16T14:48:47.459267348Z [notice] A new release of pip available: 22.3.1 -> 25.3
2025-11-16T14:48:47.459270248Z [notice] To update, run: pip install --upgrade pip
2025-11-16T14:48:51.112563949Z ==> Uploading build...
2025-11-16T14:49:07.051191703Z ==> Uploaded in 12.2s. Compression took 3.7s
2025-11-16T14:49:07.121289745Z ==> Build successful 🎉
2025-11-16T14:49:12.555765909Z ==> Deploying...
2025-11-16T14:49:45.269736299Z ==> Running 'gunicorn api.app:app'
2025-11-16T14:49:53.06742935Z /opt/render/project/src/.venv/lib/python3.10/site-packages/google/api_core/_python_version_support.py:266: FutureWarning: You are using a Python version (3.10.10) which Google will stop supporting in new releases of google.api_core once it reaches its end of life (2026-10-04). Please upgrade to the latest Python version, or at least Python 3.11, to continue receiving updates for google.api_core past that date.
2025-11-16T14:49:53.067466302Z   warnings.warn(message, FutureWarning)
2025-11-16T14:49:57.165849059Z Traceback (most recent call last):
2025-11-16T14:49:57.165873741Z   File "/opt/render/project/src/.venv/bin/gunicorn", line 8, in <module>
2025-11-16T14:49:57.165880421Z     sys.exit(run())
2025-11-16T14:49:57.165886972Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/wsgiapp.py", line 67, in run
2025-11-16T14:49:57.165893552Z     WSGIApplication("%(prog)s [OPTIONS] [APP_MODULE]").run()
2025-11-16T14:49:57.165899272Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/base.py", line 236, in run
2025-11-16T14:49:57.165904782Z     super().run()
2025-11-16T14:49:57.165910113Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/base.py", line 72, in run
2025-11-16T14:49:57.165916063Z     Arbiter(self).run()
2025-11-16T14:49:57.165920393Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/arbiter.py", line 58, in __init__
2025-11-16T14:49:57.165923894Z     self.setup(app)
2025-11-16T14:49:57.165927334Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/arbiter.py", line 118, in setup
2025-11-16T14:49:57.165930824Z     self.app.wsgi()
2025-11-16T14:49:57.165934154Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/base.py", line 67, in wsgi
2025-11-16T14:49:57.165938424Z     self.callable = self.load()
2025-11-16T14:49:57.165941804Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/wsgiapp.py", line 58, in load
2025-11-16T14:49:57.165945165Z     return self.load_wsgiapp()
2025-11-16T14:49:57.165949155Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/wsgiapp.py", line 48, in load_wsgiapp
2025-11-16T14:49:57.165952665Z     return util.import_app(self.app_uri)
2025-11-16T14:49:57.165955995Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/util.py", line 371, in import_app
2025-11-16T14:49:57.165959375Z     mod = importlib.import_module(module)
2025-11-16T14:49:57.165962756Z   File "/opt/render/project/python/Python-3.10.10/lib/python3.10/importlib/__init__.py", line 126, in import_module
2025-11-16T14:49:57.165966206Z     return _bootstrap._gcd_import(name[level:], package, level)
2025-11-16T14:49:57.165969656Z   File "<frozen importlib._bootstrap>", line 1050, in _gcd_import
2025-11-16T14:49:57.165973026Z   File "<frozen importlib._bootstrap>", line 1027, in _find_and_load
2025-11-16T14:49:57.165978237Z   File "<frozen importlib._bootstrap>", line 1006, in _find_and_load_unlocked
2025-11-16T14:49:57.165983777Z   File "<frozen importlib._bootstrap>", line 688, in _load_unlocked
2025-11-16T14:49:57.165988787Z   File "<frozen importlib._bootstrap_external>", line 883, in exec_module
2025-11-16T14:49:57.165994317Z   File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
2025-11-16T14:49:57.165999928Z   File "/opt/render/project/src/backend/api/app.py", line 33, in <module>
2025-11-16T14:49:57.166005228Z     from .routes.ocr import ocr_bp
2025-11-16T14:49:57.166010788Z   File "/opt/render/project/src/backend/api/routes/ocr.py", line 9, in <module>
2025-11-16T14:49:57.166024849Z     from ..ocr_service import resize_image_for_clova, call_clova_ocr, parse_clova_response_to_items
2025-11-16T14:49:57.166027809Z   File "/opt/render/project/src/backend/api/ocr_service.py", line 12, in <module>
2025-11-16T14:49:57.166030089Z     from PIL import Image
2025-11-16T14:49:57.166032289Z ModuleNotFoundError: No module named 'PIL'
2025-11-16T14:50:01.911192947Z ==> Exited with status 1
2025-11-16T14:50:01.926541576Z ==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys
2025-11-16T14:50:08.481365833Z ==> Running 'gunicorn api.app:app'