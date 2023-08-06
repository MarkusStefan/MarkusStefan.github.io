# My personal website
### To push updates from the local machine to the remote repository, consider following steps
- create a directory (even if parent does not exist)
```
$ mkdir -p ~/my_project
```
- navigate to the target directory
```
$ cd my_project
```
- create a gitignore file
```
$ touch .gitignore
```
- initialization stuff for repo
```
$ git init
```
- add any changes of all files in the repository
```
$ git add .
$ git add <filename.xyz>
```
- commit the changes and include a message
```
$ git commit -m "Initial commit"
```
- connect to a newly created repository on **GitHub**
```
$ git remote add NAME_OF_REMOTE_CONNECTION https://github.com/MarkusStefan/NAME_OF_REPOSITORY.git
```
... at this stage, authentication is required ...
- push the changes to the remote repository
```
$ git push NAME_OF_REMOTE_CONNECTION main
$ git push NAME_OF_REMOTE_CONNECTION master
```
