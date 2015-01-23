editor
==============

## collaborative text editor




## hacking
- this is a static client side web app (see https://github.com/hansent/generator-appstract).
- react (http://facebook.github.io/react/)
- codemirror(http://codemirror.net/)
- node, browserify, gulp

#### git

```
git clone git@github.com:saskavi/editor.git
```

#### running / hacking
just `cd editor` and run `gulp`.  The default build task watches for file changes, rerun necesary build tasks, and updates the browser via websocket.  This is done with browsersync (http://browsersync.io/).  Build tasks copy/write everything into the build directory. The printed text on the default gulp task shows you host/ip and port on which its running the server. 










