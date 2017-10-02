#!/usr/bin/env node

const path = require('path')
const { execSync } = require('child_process')
const packageJson = require('package-json')
const semver = require('semver') // package-json
const table = require('text-table')
const { list } = require('./config')

run()

async function run() {
  const globalNodeModule = path.join(getPrefix(), 'node_modules')
  const arr = []
  for (const item of list) {
    arr.push(await view(item, globalNodeModule))
  }

  const outdated = []
  arr.forEach(x => {
    if (semver.gt(x[2], x[1])) {
      outdated.push(x[0])
    }
  })
  arr.unshift(['name', 'current', 'latest'])
  console.log(table(arr))
  console.log()
  if (outdated.length) {
    console.log('Updates:')
    console.log('npm install -g', outdated.join(' '))
  } else {
    console.log('No updates')
  }
}

function getPrefix() {
  return execSync('npm config get prefix').toString().trim()
}

async function view(name, globalNodeModule) {
  let latest
  try {
    const data = await packageJson(name)
    latest = data.version
  } catch (err) {
    console.error('Failed to get version:', name)
  }

  const current = require(path.join(globalNodeModule, name, 'package.json')).version
  return [name, current, latest]
}
