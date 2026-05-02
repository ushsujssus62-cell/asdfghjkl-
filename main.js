const form = document.getElementById('name-form');
const input = document.getElementById('name-input');
const resultCard = document.getElementById('result-card');
const displayName = document.getElementById('display-name');
const topCountry = document.getElementById('top-country');
const confidenceText = document.getElementById('confidence');
const countriesCount = document.getElementById('countries-count');
const distributionList = document.getElementById('distribution-list');
const messageBox = document.getElementById('message-box');
const searchButton = document.getElementById('search-button');
const API_PROXY = 'https://api.codetabs.com/v1/proxy?quest=';

function setMessage(message) {
  messageBox.textContent = message;
}

function setLoading(isLoading) {
  searchButton.disabled = isLoading;
  searchButton.textContent = isLoading ? 'Loading...' : 'Analyze';
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function renderCountryRow(code, name, probability) {
  const percent = formatPercent(probability);
  const row = document.createElement('div');
  row.className = 'space-y-3';
  row.innerHTML = `
    <div class="flex items-center justify-between text-sm uppercase tracking-[0.25em] text-slate-500">
      <span>${code}</span>
      <span>${percent}</span>
    </div>
    <div class="rounded-3xl bg-slate-950/80 p-4">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-base font-semibold text-slate-100">${name}</p>
          <p class="text-sm text-slate-500">${code}</p>
        </div>
        <div class="h-3 flex-1 rounded-full bg-slate-800">
          <div class="h-full rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500" style="width: ${Math.max(5, probability * 100)}%;"></div>
        </div>
      </div>
    </div>
  `;
  return row;
}

async function fetchJsonWithFallback(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (directError) {
    console.warn('Direct fetch failed, trying proxy:', directError);
    const proxyResponse = await fetch(`${API_PROXY}${encodeURIComponent(url)}`);
    if (!proxyResponse.ok) throw new Error(`Proxy fetch failed with status ${proxyResponse.status}`);
    return await proxyResponse.json();
  }
}

async function getCountryNames(codes) {
  if (!codes.length) return {};
  try {
    const response = await fetchJsonWithFallback(`https://restcountries.com/v3.1/alpha?codes=${codes.join(',')}`);
    return response.reduce((map, country) => {
      const code = (country.cca2 || '').toUpperCase();
      if (code) map[code] = country.name.common || code;
      return map;
    }, {});
  } catch (error) {
    console.warn('Country lookup failed', error);
    return {};
  }
}

function showResults(name, countryData, countryNames) {
  displayName.textContent = name;
  const top = countryData[0];
  topCountry.textContent = countryNames[top.country_id] || top.country_id;
  confidenceText.textContent = formatPercent(top.probability);
  countriesCount.textContent = `${countryData.length} countries found`;
  distributionList.innerHTML = '';
  countryData.forEach((item) => {
    const countryName = countryNames[item.country_id] || item.country_id;
    distributionList.appendChild(renderCountryRow(item.country_id, countryName, item.probability));
  });
  resultCard.classList.remove('hidden');
}

function showNoData(name) {
  setMessage(`No nationality data found for "${name}". Please try another name.`);
  resultCard.classList.add('hidden');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = input.value.trim();
  if (!name) {
    setMessage('Iltimos ism kiriting.');
    return;
  }

  setMessage('');
  setLoading(true);

  try {
    const data = await fetchJsonWithFallback(`https://api.nationalize.io?name=${encodeURIComponent(name)}`);

    if (!data.country || !data.country.length) {
      showNoData(name);
      return;
    }

    const codes = data.country.map((item) => item.country_id);
    const countryNames = await getCountryNames(codes);
    showResults(name, data.country, countryNames);
  } catch (error) {
    console.error(error);
    setMessage(`Xatolik yuz berdi: ${error.message}. Internetni tekshiring va qaytadan urinib ko‘ring.`);
    resultCard.classList.add('hidden');
  } finally {
    setLoading(false);
  }
});
