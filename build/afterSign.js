const fs = require('fs')
const path = require('path')
const asar = require('asar')
const JavaScriptObfuscator = require('javascript-obfuscator') //使用javascript-obfuscator代码混淆

//获取指定文件夹下排除指定类型的文件
function getFiles(dirpath, exclude) {
  function getFiles_(dir, arr) {
    const stat = fs.statSync(dir)
    if (stat.isDirectory()) {
      const dirs = fs.readdirSync(dir)
      dirs.forEach((value) => {
        const extname = path.extname(value)
        if (!exclude.includes(value) && !exclude.includes(extname))
          getFiles_(path.join(dir, value), arr)
      })
    } else if (stat.isFile()) {
      //文件
      arr.push(dir)
    }
  }
  const arrs = []
  getFiles_(dirpath, arrs)
  return arrs
}

async function afterSign({ appOutDir, packager }) {
  // appOutDir = '/Users/joey/Code/crawler/xhs-electron-app/dist/mac-arm64'
  try {
    const asarPath = path.join(packager.getResourcesDir(appOutDir), 'app.asar')
    const appPath = path.join(packager.getResourcesDir(appOutDir), 'app')
    // const asarPath = appOutDir + '/app.asar'
    // const appPath = appOutDir + '/xFox.app/Contents/Resources/app'
    console.log('asar path: ', asarPath)
    console.log('app path: ', appPath)
    if (fs.existsSync(asarPath)) {
      //如果存在asar压缩包
      asar.extractAll(asarPath, appPath)
    }
    //替换文件内容

    const fileArrs = getFiles(appPath, [
      'node_modules',
      'public',
      '.css',
      '.html',
      '.md',
      '.cjs',
      '.json',
      '.xml',
      '.jsc',
      '.png',
      '.woff2',
      '.DS_Store'
    ]).filter((e) => {
      return ['vendor', 'out/preload', 'out/renderer'].every((str) => !e.includes(str))
    })

    console.log(fileArrs)

    for (let i = 0; i < fileArrs.length; i++) {
      console.log('run ', i)
      const con = fs.readFileSync(fileArrs[i], 'utf8')
      const obfuscationResult = JavaScriptObfuscator.obfuscate(con, {
        compact: true,
        debugProtection: true,
        disableConsoleOutput: true,
        numbersToExpressions: true,
        simplify: true,
        stringArrayShuffle: true,
        splitStrings: true,
        stringArrayThreshold: 1
      })
      fs.writeFileSync(fileArrs[i], obfuscationResult.getObfuscatedCode())
    }

    console.log('asar content replacement completed.')
    if (fs.existsSync(asarPath)) {
      fs.unlinkSync(asarPath)
      console.log('delete the original asar.')
    }
    await asar.createPackage(appPath, asarPath)
    fs.rmdirSync(appPath, { recursive: true })
    console.log('create new asar.')
  } catch (err) {
    console.log()
    console.error(err)
  }
  console.log('done!')
}

afterSign({})

module.exports = afterSign
