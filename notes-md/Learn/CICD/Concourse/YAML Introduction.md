https://concourse-ci.org/config-basics.html



```javascript
# commented lines are prefixed with the '#' character

# strings
quoted_string: "bar"
unquoted_string: hello world!
multiline_string: |
  hello, world!
  this is one big string with a trailing linebreak!

# arrays
array: [hello, world]
multiline_array:
- hello
- world

# objects
object: {one: uno, two: dos}
multiline_object:
  one: uno
  two: dos

# boolean values
booleans: [true, false]

# numeric values
numeric: [1234, 12.34]
```

