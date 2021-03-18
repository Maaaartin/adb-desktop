# osascript -e 'tell application "Terminal" to activate' -e 'tell application "System Events" to tell process "Terminal" to keystroke "t" using command down'
# cd $1
a="'tell app \"Terminal\"
    do script \"echo ${$1}\""
echo a
# osascript -e "\"${a} end tell\""
