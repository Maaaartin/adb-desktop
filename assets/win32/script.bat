echo off
set arg1=%1
set arg2=%2
set arg1=%arg1:"=%
set arg2=%arg2:"=%
cd %arg1%
%arg2%

