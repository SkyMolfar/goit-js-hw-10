// fetchCountries.js

import axios from 'axios';
import debounce from 'lodash.debounce';
import Notiflix from 'notiflix';

const searchBox = document.querySelector("#search-box");
const countryList= document.querySelector(".country-list");
const countryInfo = document.querySelector(".country-info");

searchBox.addEventListener('input', (e) => {
  searchCountries(e.target.value, (countries)=> {
    countryList.innerHTML = '';
    countryInfo.innerHTML = '';
    
    if (countries.length == 0) {
      return; 
    }

    if (countries.length == 1) {
      let info = buildCountryInfo(countries.pop());
      countryInfo.innerHTML = info;
    } else {
      let list = buildCountriesList(countries);
      countryList.innerHTML = list;
    }
  });
})

function buildCountryInfo(country){
    return `
      <h1>${buildFlag(country.flags)} ${country.name}</h1>
      <p><b>Capital</b>: ${country.capital}</p>
      <p><b>Population</b>: ${country.population}</p>
      <p><b>Languages</b>: ${country.languages.map(lang=> lang.name).join(", ")}</p>
    `
}

function buildCountriesList(countries = []) {
    let template = (country) => `
      <li>${buildFlag(country.flags)} ${country.name}</li>
    `;
    let res = "";
    countries.forEach((country) => res += template(country));
    return res;
}

function buildFlag(flags) { 
  return <img src="${flags.svg}" style="max-width: 30px; max-height: 20px;" />
}

export const fetchCountries = (name) => {
  const params = {
    fields: 'name,capital,population,flags,languages'
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
      } else {
        callback(data);
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