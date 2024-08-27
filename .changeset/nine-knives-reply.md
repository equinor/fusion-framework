---
'@equinor/fusion-log': minor
---

Removed formatting of messages in the `log` function. Now the messages are printed as they are, without any additional formatting. This is done to make the messages more readable and to avoid any additional formatting that might be added by the user. Formatting objects would result in the console outputting `[[object,object]]` which was not very helpful.
