@echo off
setlocal disableDelayedExpansion
set "file1=startcommits.txt"
set "file2=endcommits.txt"
set "out=changes.txt"

>"%file2%.tmp" findstr /n "^" "%file2%"
>"%out%" (
  for /f "tokens=1* delims=:" %%A in ('findstr /n "^" "%file1%"') do (
    set "found="
    for /f "tokens=1* delims=:" %%a in ('findstr "^%%A:" "%file2%.tmp"') do (
      set found=1
      git diff --shortstat %%B %%b
    )
    if not defined found (echo %%B - )
  )
)
del "%file2%.tmp"
type "%out%"