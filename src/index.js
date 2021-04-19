import './index.scss'

import { form, formUrl, formMethod, formBody, formInputsWrap, 
  addNewHeaderButton, addDataButton, resultSection, 
  clearHistoryButton, resultTexts } from './utils/constants';

function createNewHeaderInput(headerName = '', headerValue = '') {
  const wrap = document.createElement('div');
  const headerInput = document.createElement('input');
  const valueInput = document.createElement('input');
  const deleteButton = document.createElement('button');
  const headerInputNumber = countHeaderInputs();

  wrap.classList.add('form__input-wrap');
  headerInput.classList.add('form__input', 'form__input_type_text', 'form__input_type_header');
  valueInput.classList.add('form__input', 'form__input_type_text', 'form__input_type_value');
  deleteButton.classList.add('form__delete-input-button');

  headerInput.placeholder = `Header ${headerInputNumber + 1}`;
  valueInput.placeholder = `Value ${headerInputNumber + 1}`

  headerInput.value = headerName;
  valueInput.value = headerValue;

  deleteButton.textContent = 'X';
  deleteButton.addEventListener('click', (evt) => {
    evt.preventDefault();
    formInputsWrap.removeChild(wrap);
  })
  wrap.append(headerInput, valueInput, deleteButton)
  return wrap;
}

function countHeaderInputs() {
  return form.querySelectorAll('.form__input-wrap').length;
}

function addAllData(status) {
  const result = {}
  const headers = document.querySelectorAll('.form__input-wrap');
  result.status = status;
  result.url = formUrl.value;
  result.method = formMethod.value;
  if (result.method.value !== 'GET') {
    result.body = formBody.value;
  }
  const res = {}
  headers.forEach((header) => {
    res[header.querySelector('.form__input_type_header').value] = header.querySelector('.form__input_type_value').value;
  });
  result.header = res;
  result.date = Date.now();
  return result;
}

function formCreatedRequest(data) {
  const resultWrap = document.createElement('div');
  const title = document.createElement('h2');
  const result = document.createElement('p');
  const status = document.createElement('p');
  const url = document.createElement('p');
  const method = document.createElement('p');
  const body = document.createElement('span');
  const bodyTitle = document.createElement('p');
  const headerLists = document.createElement('ul');
  const headerTitle = document.createElement('p');
  const repeatButton = document.createElement('button');

  resultWrap.classList.add('result__container');
  title.classList.add('result__text', 'result__title');
  result.classList.add('result__text')
  status.classList.add('result__text')
  url.classList.add('result__text')
  method.classList.add('result__text')
  bodyTitle.classList.add('result__text')
  headerLists.classList.add('result__text')
  headerTitle.classList.add('result__text')
  headerLists.classList.add('result__text', 'result__lists')
  headerTitle.classList.add('result__text')
  body.classList.add('result__body')

  repeatButton.textContent = 'repeat request';
  headerTitle.textContent = 'Response Headers:';
  Object.keys(data.responseHeaders).forEach(item => {
    const headerName = document.createElement('p');
    headerName.classList.add('result__header-text');
    const headerListItem = document.createElement('li');
    headerName.textContent = item + ': ' + data.responseHeaders[item];
    headerListItem.append(headerName);
    headerLists.append(headerListItem);
  })

  if (data.requestedBody) {
    bodyTitle.textContent = 'Request Body: ';
    body.textContent = data.requestedBody;
  }

  url.textContent = `URL: ${data.url}`;
  method.textContent = `Method: ${data.method}`;
  status.textContent = `Status: ${data.status}`;
  result.textContent = `Result: ${data.status < 299 ? 'Ok' : 'Failure'}`;

  const todayDate = data.todayDate;
  title.textContent = todayDate + ' - ' + data.method;

  repeatButton.addEventListener('click', () => {
    formUrl.value = data.url;
    formMethod.value = data.method;
    if(data.method !== 'GET') {
      data.requestedBody ? formBody.value = data.requestedBody : '';
      formBody.classList.remove('form__element_type_hidden');
      addNewHeaderButton.classList.remove('form__element_type_hidden');
      Object.keys(data.responseHeaders).forEach(item => {
        formInputsWrap.append(createNewHeaderInput(item, data.responseHeaders[item]));
      })
    }
  });
  resultWrap.append(title, url, result, status, method, headerTitle, headerLists, bodyTitle, body, repeatButton);
  return resultWrap;
}

function clearForm() {
  addNewHeaderButton.classList.add('form__element_type_hidden');
  formBody.classList.add('form__element_type_hidden');
  const headerInputs = document.querySelectorAll('.form__input-wrap');
  headerInputs.forEach(item => {
    formInputsWrap.removeChild(item);
  })
  form.reset();
}

// convert incoming data for localstorage
function convertToStorage(data) {
  const headers = {}
  const storagedData = {}
  const todayDate = new Date().toISOString().slice(0, 19);
  storagedData.url = data.url;
  storagedData.method = data.method;
  storagedData.status = data.status;
  storagedData.todayDate = todayDate;
  storagedData.requestedBody = data.requestedBody;
  for (const pair of data.headers.entries()) {
    headers[pair[0]] = pair[1];
  };
  storagedData.responseHeaders = headers;
  return storagedData;
}

function addDataToLocalStorage(data) {
  let allData = [];
  if (localStorage.getItem('storagedData')) { allData = JSON.parse(localStorage.getItem('storagedData')); }
  allData.push(data);
  localStorage.setItem('storagedData', JSON.stringify(allData));
}

function renderAllDataFromLocalStorage() {
  console.log('rendered');
  let allData = [];
  if (localStorage.getItem('storagedData')) { 
    allData = JSON.parse(localStorage.getItem('storagedData')); 
  }
  if(allData.length == 0) {
    resultTexts.classList.remove('result-section__texts_type_hidden');
    clearHistoryButton.classList.add('result-section__clear-button_type_hidden');
  } else {
    resultTexts.classList.add('result-section__texts_type_hidden');
    clearHistoryButton.classList.remove('result-section__clear-button_type_hidden');
  }
  allData.forEach(item => {
    resultSection.prepend(formCreatedRequest(item));
  })
}

function renderLastDataFromStorage() {
  const data = JSON.parse(localStorage.getItem('storagedData'));
  if (data) {
    resultSection.prepend(formCreatedRequest(data[data.length - 1]))
    resultTexts.classList.add('result-section__texts_type_hidden');
    clearHistoryButton.classList.remove('result-section__clear-button_type_hidden');
  }
}

function sendRequest(url, method, headers, body) {
  if (method === 'GET') {
    return fetch(url, {
      method: method,
    })
  } else {
    return fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(body),
    })
      .then((response) => {
        response.requestedBody = body;
        return response;
      })
  }
}

renderAllDataFromLocalStorage();

addDataButton.addEventListener('click', (evt) => {
  evt.preventDefault();
  const formData = addAllData();
  sendRequest(formData.url, formData.method, formData.header, formData.body)
    .then((data) => {
      data.method = formData.method;
      data.requstedDody = formData.body;
      addDataToLocalStorage(convertToStorage(data));
      renderLastDataFromStorage();
      clearForm();
    })
    .catch(err => {
      //renderReqestedData(err)
      console.log('#### ERROR!!! ', err);
    });
})

formMethod.addEventListener('input', (evt) => {
  if (evt.target.value === 'GET') {
    clearForm();
  } else {
    addNewHeaderButton.classList.remove('form__element_type_hidden');
    formBody.classList.remove('form__element_type_hidden');
  }
});

addNewHeaderButton.addEventListener('click', (evt) => {
  evt.preventDefault();
  formInputsWrap.append(createNewHeaderInput());
});

clearHistoryButton.addEventListener('click', () => {
  localStorage.removeItem('storagedData');
  document.querySelectorAll('.result__container').forEach(item => {
    resultSection.removeChild(item);
  });
  resultTexts.classList.remove('result-section__texts_type_hidden');
  clearHistoryButton.classList.add('result-section__clear-button_type_hidden');
  clearForm();
});
