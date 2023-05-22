// fetchCountries.js

import axios from 'axios';
import debounce from 'lodash.debounce';
import Notiflix from 'notiflix';

export const fetchCountries = (name) => {
  const params = {
    fields: 'name.official,capital,population,flags.svg,languages'
  };

  return axios.get(`https://restcountries.com/v2/name/${name}`, { params })
    .then(response => response.data)
    .catch(error => {
      if (error.response && error.response.status === 404) {
        throw new Error('Country not found');
      } else {
        console.log('Помилка при отриманні даних про країни:', error);
        return [];
      }
    });
};

export const searchCountries = debounce((searchValue, callback) => {
  const sanitizedValue = searchValue.trim();

  if (sanitizedValue === '') {
    callback([]);
    return;
  }

  fetchCountries(sanitizedValue)
    .then(data => {
      const numCountries = data.length;

      if (numCountries > 10) {
        Notiflix.Notify.info('Too many matches found. Please enter a more specific name.');
        callback([]);
      } else if (numCountries >= 2 && numCountries <= 10) {
        callback(data);
      } else if (numCountries === 1) {
        callback(data);
      } else {
        callback([]);
      }
    })
    .catch(error => {
      if (error.message === 'Country not found') {
        Notiflix.Notify.failure('Oops, there is no country with that name.');
      } else {
        console.log('Помилка при виконанні пошуку країн:', error);
      }
      callback([]);
    });
}, 300);
