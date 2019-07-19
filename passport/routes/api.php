<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('login', 'PassportController@login');
Route::post('register', 'PassportController@register');
Route::get('post/{id}', 'PostController@show');
Route::get('posts/', 'PostController@index');
Route::post('post/update/{id}', 'PostController@update');

Route::middleware('auth:api')->group(function () {
    Route::get('post/path/{path}', 'PostController@showPath');
    Route::get('post/user/{id}', 'PostController@showUser');
    Route::get('user', 'PassportController@details');
});
