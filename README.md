# SUPER SERVE!!!


Compiles Jade, Coffeescript, Less, SCSS, and Babel, from a source directory to a distribution directory.

#### To install:

```
npm i -g super-serve
```
#### Create a directory called ```src``` then run:
```
super-serve
```

The ```super-serve``` command will compile anything in the ```src``` directory to the ```dist``` directory

Super Serve uses web sockets, keeping your browser in sync with any changes to your code.

Super Serve will compile after it detects a file change in the ```src``` directory. 

For more options run ```super-serve -h```

#### Options:
```
  -p, --port number    
  --host string        
  -h, --help  
```
Super Serve listens to port 8080 by default.

Example with all options: ```super-serve -p 8081 --host YOUR_HOST_HERE```

Pull Requests are welcome http://github.com/simonhochrein/super-serve
