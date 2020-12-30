const axios = require('axios');

const HttpError = require('../models/http-error');

const API_KEY = 'AIzaSyChF9Wa8Xc0i8FWRwaOizOLRZKFCWfI-_4';

const getCoordsForAddress = async (address) => {

  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
  );

  const data = response.data;

  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError('Could not find a location for the specified address', 422);
    throw error;
  }

  const coordinates = data.results[0].geometry.location;

  return coordinates;
}

module.exports = getCoordsForAddress;
