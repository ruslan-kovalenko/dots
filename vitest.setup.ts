import 'vitest-canvas-mock'

const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

const { createCanvas } = require('canvas');
global.HTMLCanvasElement.prototype.getContext = createCanvas().getContext;