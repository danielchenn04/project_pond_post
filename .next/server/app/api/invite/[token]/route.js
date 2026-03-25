/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/invite/[token]/route";
exports.ids = ["app/api/invite/[token]/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Finvite%2F%5Btoken%5D%2Froute&page=%2Fapi%2Finvite%2F%5Btoken%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Finvite%2F%5Btoken%5D%2Froute.ts&appDir=%2FUsers%2Fdanielchen%2FProjects%2Fpond_post%2Fproject_pond_post%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fdanielchen%2FProjects%2Fpond_post%2Fproject_pond_post&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Finvite%2F%5Btoken%5D%2Froute&page=%2Fapi%2Finvite%2F%5Btoken%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Finvite%2F%5Btoken%5D%2Froute.ts&appDir=%2FUsers%2Fdanielchen%2FProjects%2Fpond_post%2Fproject_pond_post%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fdanielchen%2FProjects%2Fpond_post%2Fproject_pond_post&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_danielchen_Projects_pond_post_project_pond_post_app_api_invite_token_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/invite/[token]/route.ts */ \"(rsc)/./app/api/invite/[token]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/invite/[token]/route\",\n        pathname: \"/api/invite/[token]\",\n        filename: \"route\",\n        bundlePath: \"app/api/invite/[token]/route\"\n    },\n    resolvedPagePath: \"/Users/danielchen/Projects/pond_post/project_pond_post/app/api/invite/[token]/route.ts\",\n    nextConfigOutput,\n    userland: _Users_danielchen_Projects_pond_post_project_pond_post_app_api_invite_token_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZpbnZpdGUlMkYlNUJ0b2tlbiU1RCUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGaW52aXRlJTJGJTVCdG9rZW4lNUQlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZpbnZpdGUlMkYlNUJ0b2tlbiU1RCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmRhbmllbGNoZW4lMkZQcm9qZWN0cyUyRnBvbmRfcG9zdCUyRnByb2plY3RfcG9uZF9wb3N0JTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRmRhbmllbGNoZW4lMkZQcm9qZWN0cyUyRnBvbmRfcG9zdCUyRnByb2plY3RfcG9uZF9wb3N0JmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNzQztBQUNuSDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL1VzZXJzL2RhbmllbGNoZW4vUHJvamVjdHMvcG9uZF9wb3N0L3Byb2plY3RfcG9uZF9wb3N0L2FwcC9hcGkvaW52aXRlL1t0b2tlbl0vcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2ludml0ZS9bdG9rZW5dL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvaW52aXRlL1t0b2tlbl1cIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2ludml0ZS9bdG9rZW5dL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL1VzZXJzL2RhbmllbGNoZW4vUHJvamVjdHMvcG9uZF9wb3N0L3Byb2plY3RfcG9uZF9wb3N0L2FwcC9hcGkvaW52aXRlL1t0b2tlbl0vcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Finvite%2F%5Btoken%5D%2Froute&page=%2Fapi%2Finvite%2F%5Btoken%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Finvite%2F%5Btoken%5D%2Froute.ts&appDir=%2FUsers%2Fdanielchen%2FProjects%2Fpond_post%2Fproject_pond_post%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fdanielchen%2FProjects%2Fpond_post%2Fproject_pond_post&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(rsc)/./app/api/invite/[token]/route.ts":
/*!*****************************************!*\
  !*** ./app/api/invite/[token]/route.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_auth_invite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth/invite */ \"(rsc)/./lib/auth/invite.ts\");\n\n\nasync function GET(_req, { params }) {\n    const { token } = await params;\n    const result = await (0,_lib_auth_invite__WEBPACK_IMPORTED_MODULE_1__.validateInviteToken)(token);\n    if (!result.valid) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            valid: false,\n            error: result.error\n        }, {\n            status: 200\n        });\n    }\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        valid: true,\n        linkType: result.data?.link_type,\n        pondId: result.data?.pond_id\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2ludml0ZS9bdG9rZW5dL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUF3RDtBQUNBO0FBRWpELGVBQWVFLElBQ3BCQyxJQUFpQixFQUNqQixFQUFFQyxNQUFNLEVBQTBDO0lBRWxELE1BQU0sRUFBRUMsS0FBSyxFQUFFLEdBQUcsTUFBTUQ7SUFDeEIsTUFBTUUsU0FBUyxNQUFNTCxxRUFBbUJBLENBQUNJO0lBRXpDLElBQUksQ0FBQ0MsT0FBT0MsS0FBSyxFQUFFO1FBQ2pCLE9BQU9QLHFEQUFZQSxDQUFDUSxJQUFJLENBQUM7WUFBRUQsT0FBTztZQUFPRSxPQUFPSCxPQUFPRyxLQUFLO1FBQUMsR0FBRztZQUFFQyxRQUFRO1FBQUk7SUFDaEY7SUFFQSxPQUFPVixxREFBWUEsQ0FBQ1EsSUFBSSxDQUFDO1FBQ3ZCRCxPQUFPO1FBQ1BJLFVBQVVMLE9BQU9NLElBQUksRUFBRUM7UUFDdkJDLFFBQVFSLE9BQU9NLElBQUksRUFBRUc7SUFDdkI7QUFDRiIsInNvdXJjZXMiOlsiL1VzZXJzL2RhbmllbGNoZW4vUHJvamVjdHMvcG9uZF9wb3N0L3Byb2plY3RfcG9uZF9wb3N0L2FwcC9hcGkvaW52aXRlL1t0b2tlbl0vcm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJztcbmltcG9ydCB7IHZhbGlkYXRlSW52aXRlVG9rZW4gfSBmcm9tICdAL2xpYi9hdXRoL2ludml0ZSc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQoXG4gIF9yZXE6IE5leHRSZXF1ZXN0LFxuICB7IHBhcmFtcyB9OiB7IHBhcmFtczogUHJvbWlzZTx7IHRva2VuOiBzdHJpbmcgfT4gfVxuKSB7XG4gIGNvbnN0IHsgdG9rZW4gfSA9IGF3YWl0IHBhcmFtcztcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdmFsaWRhdGVJbnZpdGVUb2tlbih0b2tlbik7XG5cbiAgaWYgKCFyZXN1bHQudmFsaWQpIHtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyB2YWxpZDogZmFsc2UsIGVycm9yOiByZXN1bHQuZXJyb3IgfSwgeyBzdGF0dXM6IDIwMCB9KTtcbiAgfVxuXG4gIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7XG4gICAgdmFsaWQ6IHRydWUsXG4gICAgbGlua1R5cGU6IHJlc3VsdC5kYXRhPy5saW5rX3R5cGUsXG4gICAgcG9uZElkOiByZXN1bHQuZGF0YT8ucG9uZF9pZCxcbiAgfSk7XG59XG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwidmFsaWRhdGVJbnZpdGVUb2tlbiIsIkdFVCIsIl9yZXEiLCJwYXJhbXMiLCJ0b2tlbiIsInJlc3VsdCIsInZhbGlkIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwibGlua1R5cGUiLCJkYXRhIiwibGlua190eXBlIiwicG9uZElkIiwicG9uZF9pZCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/invite/[token]/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth/invite.ts":
/*!****************************!*\
  !*** ./lib/auth/invite.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   markInviteTokenUsed: () => (/* binding */ markInviteTokenUsed),\n/* harmony export */   validateInviteToken: () => (/* binding */ validateInviteToken)\n/* harmony export */ });\n/* harmony import */ var _supabase_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../supabase/server */ \"(rsc)/./lib/supabase/server.ts\");\n\nasync function validateInviteToken(token) {\n    const supabase = (0,_supabase_server__WEBPACK_IMPORTED_MODULE_0__.createServerClient)();\n    const { data, error } = await supabase.from('guardian_links').select('id, pond_id, link_type, is_used, expires_at').eq('token', token).single();\n    if (error || !data) {\n        return {\n            valid: false,\n            error: 'Link not found'\n        };\n    }\n    if (data.is_used) {\n        return {\n            valid: false,\n            error: 'This link has already been used'\n        };\n    }\n    if (new Date(data.expires_at) < new Date()) {\n        return {\n            valid: false,\n            error: 'This link has expired'\n        };\n    }\n    return {\n        valid: true,\n        data: {\n            pond_id: data.pond_id,\n            link_type: data.link_type,\n            id: data.id\n        }\n    };\n}\nasync function markInviteTokenUsed(id) {\n    const supabase = (0,_supabase_server__WEBPACK_IMPORTED_MODULE_0__.createServerClient)();\n    await supabase.from('guardian_links').update({\n        is_used: true\n    }).eq('id', id);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC9pbnZpdGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQXdEO0FBRWpELGVBQWVDLG9CQUFvQkMsS0FBYTtJQUtyRCxNQUFNQyxXQUFXSCxvRUFBa0JBO0lBRW5DLE1BQU0sRUFBRUksSUFBSSxFQUFFQyxLQUFLLEVBQUUsR0FBRyxNQUFNRixTQUMzQkcsSUFBSSxDQUFDLGtCQUNMQyxNQUFNLENBQUMsK0NBQ1BDLEVBQUUsQ0FBQyxTQUFTTixPQUNaTyxNQUFNO0lBRVQsSUFBSUosU0FBUyxDQUFDRCxNQUFNO1FBQ2xCLE9BQU87WUFBRU0sT0FBTztZQUFPTCxPQUFPO1FBQWlCO0lBQ2pEO0lBRUEsSUFBSUQsS0FBS08sT0FBTyxFQUFFO1FBQ2hCLE9BQU87WUFBRUQsT0FBTztZQUFPTCxPQUFPO1FBQWtDO0lBQ2xFO0lBRUEsSUFBSSxJQUFJTyxLQUFLUixLQUFLUyxVQUFVLElBQUksSUFBSUQsUUFBUTtRQUMxQyxPQUFPO1lBQUVGLE9BQU87WUFBT0wsT0FBTztRQUF3QjtJQUN4RDtJQUVBLE9BQU87UUFBRUssT0FBTztRQUFNTixNQUFNO1lBQUVVLFNBQVNWLEtBQUtVLE9BQU87WUFBRUMsV0FBV1gsS0FBS1csU0FBUztZQUFFQyxJQUFJWixLQUFLWSxFQUFFO1FBQUM7SUFBRTtBQUNoRztBQUVPLGVBQWVDLG9CQUFvQkQsRUFBVTtJQUNsRCxNQUFNYixXQUFXSCxvRUFBa0JBO0lBQ25DLE1BQU1HLFNBQVNHLElBQUksQ0FBQyxrQkFBa0JZLE1BQU0sQ0FBQztRQUFFUCxTQUFTO0lBQUssR0FBR0gsRUFBRSxDQUFDLE1BQU1RO0FBQzNFIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsY2hlbi9Qcm9qZWN0cy9wb25kX3Bvc3QvcHJvamVjdF9wb25kX3Bvc3QvbGliL2F1dGgvaW52aXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZVNlcnZlckNsaWVudCB9IGZyb20gJy4uL3N1cGFiYXNlL3NlcnZlcic7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2YWxpZGF0ZUludml0ZVRva2VuKHRva2VuOiBzdHJpbmcpOiBQcm9taXNlPHtcbiAgdmFsaWQ6IGJvb2xlYW47XG4gIGRhdGE/OiB7IHBvbmRfaWQ6IHN0cmluZzsgbGlua190eXBlOiBzdHJpbmc7IGlkOiBzdHJpbmcgfTtcbiAgZXJyb3I/OiBzdHJpbmc7XG59PiB7XG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlU2VydmVyQ2xpZW50KCk7XG5cbiAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAuZnJvbSgnZ3VhcmRpYW5fbGlua3MnKVxuICAgIC5zZWxlY3QoJ2lkLCBwb25kX2lkLCBsaW5rX3R5cGUsIGlzX3VzZWQsIGV4cGlyZXNfYXQnKVxuICAgIC5lcSgndG9rZW4nLCB0b2tlbilcbiAgICAuc2luZ2xlKCk7XG5cbiAgaWYgKGVycm9yIHx8ICFkYXRhKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0xpbmsgbm90IGZvdW5kJyB9O1xuICB9XG5cbiAgaWYgKGRhdGEuaXNfdXNlZCkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdUaGlzIGxpbmsgaGFzIGFscmVhZHkgYmVlbiB1c2VkJyB9O1xuICB9XG5cbiAgaWYgKG5ldyBEYXRlKGRhdGEuZXhwaXJlc19hdCkgPCBuZXcgRGF0ZSgpKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ1RoaXMgbGluayBoYXMgZXhwaXJlZCcgfTtcbiAgfVxuXG4gIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiB7IHBvbmRfaWQ6IGRhdGEucG9uZF9pZCwgbGlua190eXBlOiBkYXRhLmxpbmtfdHlwZSwgaWQ6IGRhdGEuaWQgfSB9O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFya0ludml0ZVRva2VuVXNlZChpZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlU2VydmVyQ2xpZW50KCk7XG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2d1YXJkaWFuX2xpbmtzJykudXBkYXRlKHsgaXNfdXNlZDogdHJ1ZSB9KS5lcSgnaWQnLCBpZCk7XG59XG4iXSwibmFtZXMiOlsiY3JlYXRlU2VydmVyQ2xpZW50IiwidmFsaWRhdGVJbnZpdGVUb2tlbiIsInRva2VuIiwic3VwYWJhc2UiLCJkYXRhIiwiZXJyb3IiLCJmcm9tIiwic2VsZWN0IiwiZXEiLCJzaW5nbGUiLCJ2YWxpZCIsImlzX3VzZWQiLCJEYXRlIiwiZXhwaXJlc19hdCIsInBvbmRfaWQiLCJsaW5rX3R5cGUiLCJpZCIsIm1hcmtJbnZpdGVUb2tlblVzZWQiLCJ1cGRhdGUiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth/invite.ts\n");

/***/ }),

/***/ "(rsc)/./lib/supabase/server.ts":
/*!********************************!*\
  !*** ./lib/supabase/server.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createServerClient: () => (/* binding */ createServerClient)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/index.mjs\");\n\nfunction createServerClient() {\n    const url = \"https://cfkesusyzolkoqoysimy.supabase.co\";\n    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;\n    return (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(url, key, {\n        auth: {\n            persistSession: false\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3VwYWJhc2Uvc2VydmVyLnRzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQXFEO0FBRTlDLFNBQVNDO0lBQ2QsTUFBTUMsTUFBTUMsMENBQW9DO0lBQ2hELE1BQU1HLE1BQU1ILFFBQVFDLEdBQUcsQ0FBQ0cseUJBQXlCO0lBQ2pELE9BQU9QLG1FQUFZQSxDQUFDRSxLQUFLSSxLQUFLO1FBQzVCRSxNQUFNO1lBQUVDLGdCQUFnQjtRQUFNO0lBQ2hDO0FBQ0YiLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYW5pZWxjaGVuL1Byb2plY3RzL3BvbmRfcG9zdC9wcm9qZWN0X3BvbmRfcG9zdC9saWIvc3VwYWJhc2Uvc2VydmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTZXJ2ZXJDbGllbnQoKSB7XG4gIGNvbnN0IHVybCA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCE7XG4gIGNvbnN0IGtleSA9IHByb2Nlc3MuZW52LlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkhO1xuICByZXR1cm4gY3JlYXRlQ2xpZW50KHVybCwga2V5LCB7XG4gICAgYXV0aDogeyBwZXJzaXN0U2Vzc2lvbjogZmFsc2UgfSxcbiAgfSk7XG59XG4iXSwibmFtZXMiOlsiY3JlYXRlQ2xpZW50IiwiY3JlYXRlU2VydmVyQ2xpZW50IiwidXJsIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsImtleSIsIlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkiLCJhdXRoIiwicGVyc2lzdFNlc3Npb24iXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/supabase/server.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tslib","vendor-chunks/iceberg-js"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Finvite%2F%5Btoken%5D%2Froute&page=%2Fapi%2Finvite%2F%5Btoken%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Finvite%2F%5Btoken%5D%2Froute.ts&appDir=%2FUsers%2Fdanielchen%2FProjects%2Fpond_post%2Fproject_pond_post%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fdanielchen%2FProjects%2Fpond_post%2Fproject_pond_post&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();