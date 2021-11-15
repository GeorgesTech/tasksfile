#!/usr/bin/env node
const path = require('path')
const omelette = require('omelette')
const { cli } = require('../lib/index')

const comp = omelette("task <task>")
comp.on("task", ({ reply }) => {
  reply(tasks(load('tasksfile.js')))
})

comp.init()

function completion() {
  comp.setupShellInitFile()
}

function load(file = 'tasksfile.js') {
  let tasksfile

  try {
    tasksfile = require(path.resolve(file))
  } catch (err) {
    console.error(`Can't resolve ${file} in your current directory`)
    process.exit(1)
  }
  
  if (tasksfile.default) {
    return tasksfile.default
  }
  return tasksfile
}

function tasks(obj, namespace) {
  let list = []
  Object.keys(obj).forEach(key => {
    const value = obj[key]
    const nextNamespace = namespace ? `${namespace}:${key}` : key

    if (typeof value === "function") {
      list.push(nextNamespace)
    } else if (typeof value === "object") {
      list = list.concat(tasks(value, nextNamespace))
    }
  })
  return list
}

function exec() {
  const tasks = load('tasksfile.js')
  
  cli(tasks)
}

try {
  const [cmd, ..._args] = process.argv.slice(2)
  switch (cmd) {
    case 'completion': return completion({ argv: process.argv, env: process.env })
    default: return exec({ argv: process.argv, env: process.env })
  }
} catch (error) {
  process.exit(1)
}
