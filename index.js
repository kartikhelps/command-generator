const fs = require("fs")
const Handlebars = require("handlebars")
var sh = require("shelljs")
const jsonData = require("./pass")
const createFile = async (obj, name, path) => {
  try {
    if (path) {
      fs.mkdirSync(path, { recursive: true })
      fs.writeFileSync(path + name, obj)
      return true
    } else {
      fs.writeFileSync(name, obj)
      return true
    }
  } catch (e) {
    return e.message
  }
}

Handlebars.registerHelper("concat", function () {
  arguments = [...arguments].slice(0, -1)

  return arguments.join("")
})

Handlebars.registerHelper("regex", function (value, name, options) {
  if (!value) return false
  if (value.includes("Regex")) {
    return `!(${value}.test(formData.${name.split(" ").join("")}))`
  } else {
    map = { eq: "===", gt: ">", lt: "<", lteq: "<==" }
    v = value.split(/[.()]/)
    return `
    !(formData.${name.split(" ").join("")} ${map[v[1].trim()]} formData.${v[2]})`
  }
})

Handlebars.registerHelper("action", function (value, options) {
  return ""
})

Handlebars.registerHelper("switch", function (value, options) {
  this.switch_value = value
  var html = options.fn(this)
  this.switch_break = false
  return html
})

Handlebars.registerHelper("case", function (value, options) {
  if (value === this.switch_value) {
    this.switch_break = true
    return options.fn(this)
  }
})

Handlebars.registerHelper("default", function (options) {
  if (!this.switch_break) {
    return options.fn(this)
  }
})

Handlebars.registerHelper("ifeq", function (a, b, options) {
  if (a == b) {
    return options.fn(this)
  }
  return options.inverse(this)
})

Handlebars.registerHelper("objToString", function (a, options) {
  Object.keys(a).forEach((item) => {
    a[item + "State"] = a[item]
    delete a[item]
  })

  let b = JSON.stringify(a)
  return b.replaceAll(/[\{\}]/g, "")
})

Handlebars.registerHelper("ifnoteq", function (a, b, options) {
  if (a != b) {
    return options.fn(this)
  }
  return options.inverse(this)
})

Handlebars.registerHelper("create", function () {
  var arg = Array.prototype.slice.call(arguments, 0, arguments.length - 1)
  templateCreator({ data: arg[0], name: arg[4], path: arg[2] }, arg[1], arg[3], arg[2])
  // [{}]     {} => data
  return ""

})

Handlebars.registerHelper('ifIn', function(elem, list, options) {
    if(list.indexOf(elem) > -1) {
        return options.fn(this);
    }
    return options.inverse(this);
});

const templateCreator = (data, file, out, path) => {
  const templateContent = fs.readFileSync(file, "utf-8")
  const template = Handlebars.compile(templateContent)
  const reactFileContent = template(data)

  createFile(reactFileContent, out, path)
}

const main = async () => {
 
  const selectedConfig = "ionic" // Change this to 'ionic' or other configurations as needed

  if (selectedConfig === "react") {
     await jsonData()
  const sheetData = require("./data.json")
    const executeReactCommands = require("./reactCommands")
    executeReactCommands(sheetData,templateCreator)
  } else if (selectedConfig === "ionic") {
    console.log("i")
     await jsonData("1SYD1Arng7eWa8BD2NOqFbfNsrhTT6NDioSE47W1ZqcM")
  const sheetData = require("./data.json")
    const executeIonicCommands = require("./ionicCommands")
    executeIonicCommands(sheetData,templateCreator)

  }
}

main()
