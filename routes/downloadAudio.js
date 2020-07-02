const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const AudioData = require('../model/audio');

const downloadAudioRouter = express.Router();
downloadAudioRouter.use(bodyParser.json());

module.exports = downloadAudioRouter;