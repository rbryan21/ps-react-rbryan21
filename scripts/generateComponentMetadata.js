var fs = require('fs'); // file system reading
var path = require('path'); // working with paths
var chalk = require('chalk'); // color command line output
var parse = require('react-docgen').parse; // look at and pull metadata out of component's code
var chokidar = require('chokidar'); // watch files and run a function in a cross-platform way

// three important paths
var paths = {
    examples: path.join(__dirname, '../src', 'docs', 'examples'), 
    components: path.join(__dirname, '../src', 'components'), // component source code
    output: path.join(__dirname, '../config', 'componentData.js') // path to output our metadata file
};

// check for watch flag
const enableWatchMode = process.argv.slice(2) == '--watch'; 
if (enableWatchMode) {
    // Regenerate component metadata when components or examples change.
    chokidar.watch([paths.examples, paths.components]).on('change', function (event, path) {
        generate(paths);
    });
} else {
    // Generate component metadata
    generate(paths);
}


function generate(paths) {
    var errors = [];
    // loop over and getting data for each component we find in our components directory
    var componentData = getDirectories(paths.components).map(function (componentName) {
        try {
            return getComponentData(paths, componentName)
        } catch (error) {
            errors.push('An error occurred while attempting to generate metadata for ' + componentName + '. ' + error);
        }
    });
    writeFile(paths.output, 'module.exports = ' + JSON.stringify(errors.length ? errors : componentData));
}

function getComponentData(paths, componentName) {
    // reads and gets the content out of the component's file
    var content = readFile(path.join(paths.components, componentName, componentName + '.js'));
    // react-docgen function that reads content and returns metadata
    var info = parse(content);
    return {
        name: componentName,
        description: info.description,
        props: info.props,
        code: content,
        examples: getExampleData(paths.examples, componentName)
    };
}

function getExampleData(examplesPath, componentName) {
    var examples = getExampleFiles(examplesPath, componentName);
    return examples.map(function (file) {
        var filePath = path.join(examplesPath, componentName, file);
        var content = readFile(filePath);
        var info = parse(content);
        return {
            // By convention, component name should match the file name.
            // So remove the .js extension to get the component name
            name: file.slice(0, -3),
            description: info.description,
            code: content
        };
    });
}

function getDirectories(filepath) {
    return fs.readdirSync(filepath).filter(function (file) {
        return fs.statSync(path.join(filepath, file)).isDirectory();
    });
}

function getFiles(filepath) {
    return fs.readdirSync(filepath).filter(function (file) {
        return fs.statSync(path.join(filepath, file)).isFile();
    });
}

function writeFile() {
    fs.writeFile(filepath, content, function (err) {
        err ? console.log(chalk.red(err)) : console.log(chalk.green("Component data saved."));
    });
}

function readFile(filepath) {
    return fs.readFileSync(filepath, 'utf-8');
}
