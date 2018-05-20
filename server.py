"""
server.py
base webserver for personal website

author: Ian Brault <ianbrault@ucla.edu>
created: 20 May 2018
"""

from aiohttp import web

async def get(req):
    """ simple GET handler """
    return web.Response(text="ian brault")

app = web.Application()
app.router.add_routes([ web.get('/', get)])
web.run_app(app)
