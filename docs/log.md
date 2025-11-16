2025-11-16T14:05:42.9528586Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/util.py", line 371, in import_app
2025-11-16T14:05:42.95286242Z     mod = importlib.import_module(module)
2025-11-16T14:05:42.9528664Z   File "/opt/render/project/python/Python-3.10.10/lib/python3.10/importlib/__init__.py", line 126, in import_module
2025-11-16T14:05:42.95287036Z     return _bootstrap._gcd_import(name[level:], package, level)
2025-11-16T14:05:42.95287422Z   File "<frozen importlib._bootstrap>", line 1050, in _gcd_import
2025-11-16T14:05:42.95288097Z   File "<frozen importlib._bootstrap>", line 1027, in _find_and_load
2025-11-16T14:05:42.95288481Z   File "<frozen importlib._bootstrap>", line 1006, in _find_and_load_unlocked
2025-11-16T14:05:42.95288863Z   File "<frozen importlib._bootstrap>", line 688, in _load_unlocked
2025-11-16T14:05:42.952892621Z   File "<frozen importlib._bootstrap_external>", line 883, in exec_module
2025-11-16T14:05:42.952896381Z   File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
2025-11-16T14:05:42.952900231Z   File "/opt/render/project/src/backend/api/app.py", line 7, in <module>
2025-11-16T14:05:42.952903951Z     from .utils.barcode_lookup import set_supabase_client
2025-11-16T14:05:42.952908481Z   File "/opt/render/project/src/backend/api/utils/barcode_lookup.py", line 5, in <module>
2025-11-16T14:05:42.952912411Z     import openfoodfacts
2025-11-16T14:05:42.952916231Z ModuleNotFoundError: No module named 'openfoodfacts'
2025-11-16T14:06:15.175637145Z ==> Running 'gunicorn api.app:app'
2025-11-16T14:06:22.178542614Z Traceback (most recent call last):
2025-11-16T14:06:22.178565175Z   File "/opt/render/project/src/.venv/bin/gunicorn", line 8, in <module>
2025-11-16T14:06:22.178569975Z     sys.exit(run())
2025-11-16T14:06:22.178574215Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/wsgiapp.py", line 67, in run
2025-11-16T14:06:22.178579955Z     WSGIApplication("%(prog)s [OPTIONS] [APP_MODULE]").run()
2025-11-16T14:06:22.178582675Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/base.py", line 236, in run
2025-11-16T14:06:22.178585285Z     super().run()
2025-11-16T14:06:22.178587485Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/base.py", line 72, in run
2025-11-16T14:06:22.178590445Z     Arbiter(self).run()
2025-11-16T14:06:22.178592715Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/arbiter.py", line 58, in __init__
2025-11-16T14:06:22.178595395Z     self.setup(app)
2025-11-16T14:06:22.178597595Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/arbiter.py", line 118, in setup
2025-11-16T14:06:22.178600035Z     self.app.wsgi()
2025-11-16T14:06:22.178602095Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/base.py", line 67, in wsgi
2025-11-16T14:06:22.178605046Z     self.callable = self.load()
2025-11-16T14:06:22.178607726Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/wsgiapp.py", line 58, in load
2025-11-16T14:06:22.178610046Z     return self.load_wsgiapp()
2025-11-16T14:06:22.178613316Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/app/wsgiapp.py", line 48, in load_wsgiapp
2025-11-16T14:06:22.178615866Z     return util.import_app(self.app_uri)
2025-11-16T14:06:22.178618146Z   File "/opt/render/project/src/.venv/lib/python3.10/site-packages/gunicorn/util.py", line 371, in import_app
2025-11-16T14:06:22.178620246Z     mod = importlib.import_module(module)
2025-11-16T14:06:22.178622396Z   File "/opt/render/project/python/Python-3.10.10/lib/python3.10/importlib/__init__.py", line 126, in import_module
2025-11-16T14:06:22.178624716Z     return _bootstrap._gcd_import(name[level:], package, level)
2025-11-16T14:06:22.178627216Z   File "<frozen importlib._bootstrap>", line 1050, in _gcd_import
2025-11-16T14:06:22.178629876Z   File "<frozen importlib._bootstrap>", line 1027, in _find_and_load
2025-11-16T14:06:22.178632006Z   File "<frozen importlib._bootstrap>", line 1006, in _find_and_load_unlocked
2025-11-16T14:06:22.178634096Z   File "<frozen importlib._bootstrap>", line 688, in _load_unlocked
2025-11-16T14:06:22.178636167Z   File "<frozen importlib._bootstrap_external>", line 883, in exec_module
2025-11-16T14:06:22.178638187Z   File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
2025-11-16T14:06:22.178640307Z   File "/opt/render/project/src/backend/api/app.py", line 7, in <module>
2025-11-16T14:06:22.178642657Z     from .utils.barcode_lookup import set_supabase_client
2025-11-16T14:06:22.178645947Z   File "/opt/render/project/src/backend/api/utils/barcode_lookup.py", line 5, in <module>
2025-11-16T14:06:22.178648507Z     import openfoodfacts
2025-11-16T14:06:22.178650807Z ModuleNotFoundError: No module named 'openfoodfacts'