#!/usr/bin/env node

var fs = require('fs')
var _ = require('underscore')._
var winston = require('winston')

var audiosprite = require('./waudsprite')

var optimist = require('optimist')
    .options('output', {
        alias: 'o'
        , 'default': 'sprite'
        , describe: 'Name for the output files.'
    })
    .options('path', {
        alias: 'u'
        , 'default': ''
        , describe: 'Path for files to be used on final JSON.'
    })
    .options('export', {
        alias: 'e'
        , 'default': 'ogg,m4a,mp3,ac3'
        , describe: 'Limit exported file types. Comma separated extension list.'
    })
    .options('log', {
        alias: 'l'
        , 'default': 'info'
        , describe: 'Log level (debug, info, notice, warning, error).'
    })
    .options('autoplay', {
        alias: 'a'
        , 'default': null
        , describe: 'Autoplay sprite name.'
    })
    .options('loop', {
        'default': null
        , describe: 'Loop sprite name, can be passed multiple times.'
    })
    .options('gap', {
        alias: 'g'
        , 'default': 1
        , describe: 'Silence gap between sounds (in seconds).'
    })
    .options('minlength', {
        alias: 'm'
        , 'default': 0
        , describe: 'Minimum sound duration (in seconds).'
    })
    .options('bitrate', {
        alias: 'b'
        , 'default': 128
        , describe: 'Bit rate. Works for: ac3, mp3, mp4, m4a, ogg.'
    })
    .options('vbr', {
        alias: 'v'
        , 'default': -1
        , describe: 'VBR [0-9]. Works for: mp3. -1 disables VBR.'
    })
    .options('samplerate', {
        alias: 'r'
        , 'default': 44100
        , describe: 'Sample rate.'
    })
    .options('channels', {
        alias: 'c'
        , 'default': 1
        , describe: 'Number of channels (1=mono, 2=stereo).'
    })
    .options('rawparts', {
        alias: 'p'
        , 'default': ''
        , describe: 'Include raw slices(for Web Audio API) in specified formats.'
    })
    .options('help', {
        alias: 'h'
        , describe: 'Show this help message.'
    })

var argv = optimist.argv
var opts = _.extend({}, argv)

winston.remove(winston.transports.Console)
winston.add(winston.transports.Console, {
    colorize: true
    , level: argv.log
    , handleExceptions: false
})
winston.debug('Parsed arguments', argv)

opts.logger = winston

opts.bitrate = parseInt(argv.bitrate, 10)
opts.samplerate = parseInt(argv.samplerate, 10)
opts.channels = parseInt(argv.channels, 10)
opts.gap = parseFloat(argv.gap)
opts.minlength = parseFloat(argv.minlength)
opts.vbr = parseInt(argv.vbr, 10)

opts.loop = argv.loop ? [].concat(argv.loop) : []

var files = _.uniq(argv._)

if (argv.help || !files.length) {
    if (!argv.help) {
        winston.error('No input files specified.')
    }
    winston.info('Usage: waudsprite [options] *.mp3')
    winston.info(optimist.help())
    process.exit(1)
}

audiosprite(files, opts, function(err, obj) {
    if (err) {
        winston.error(err)
        process.exit(0)
    }
    var jsonfile = opts.output + '.json'
    fs.writeFileSync(jsonfile, JSON.stringify(obj, null, 2))
    winston.info('Exported json OK', { file: jsonfile })
    winston.info('All done')
})