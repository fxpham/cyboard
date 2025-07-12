```
npx nodemon --watch src --ext js,vue,ts,css --exec "npm run build"
```

```
./node_modules/.bin/cyboard
```

Command

Properties

  - name      | 'ls'
  - type      | 'spec'
  - state    | idle|waiting|testing|executed
  - startTime | dd/mm/YYYY H:i

Actions

- Run    | for commands has status idle     |
  - Change status to `waiting` if no command is running otherwise `testing`
  - Send request to execute command.

- Cancel | for commands has status waiting  |
  - Change status to `idle`

- Stop   | for commands has status testing  |
  - Change status to `executed`

- Rerun  | for commands has status executed |
  - Change status to `waiting` if no command is running otherwise `testing`
  - Send request to execute command.
