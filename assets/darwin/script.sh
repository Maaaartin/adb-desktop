# osascript -e 'tell app "Terminal"
#     do script "echo hello"
# end tell'
a="tell app \"Terminal\"
    do script \"cd "$1"\r\nclear\r\n "$2"\"
end tell"
osascript -e "$a"
