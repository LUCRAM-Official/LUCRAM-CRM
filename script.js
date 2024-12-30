document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const loginContainer = document.getElementById('login-container');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const requestAccessContainer = document.getElementById('request-access-container');
    const requestAccessForm = document.getElementById('request-access-form');
    const showRequestAccessButton = document.getElementById('show-request-access');
    const backToLoginButton = document.getElementById('back-to-login');
    const header = document.querySelector('header');
    const content = document.querySelector('.content');

    const customerDetailSidebar = document.querySelector('.customer-detail-sidebar');
    const orderNumberSidebar = document.querySelector('.order-number-sidebar');
    const mainArea = document.querySelector('.main-area');
    const orderAnliegenSection = document.getElementById('order-anliegen-section');
    const anliegenDetailsSection = document.getElementById('anliegen-details-section');

    const customerSearchInput = document.getElementById('customerSearch');
    const customerSearchResultsList = document.getElementById('customer-search-results');
    const addCustomerHeaderButton = document.getElementById('add-customer-header-button');
    const settingsButton = document.getElementById('settings-button');
    const settingsScreen = document.getElementById('settings-screen');
    const closeSettingsButton = document.getElementById('close-settings');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const primaryColorPicker = document.getElementById('primary-color-picker');

    const backToCustomersButton = document.getElementById('back-to-customers');
    const backToCustomerFromOrderButton = document.getElementById('back-to-customer-from-order');
    const customerFormSidebar = document.getElementById('customer-form-sidebar');
    const customerIdInput = document.getElementById('customer-id');
    const deleteCustomerButton = document.getElementById('delete-customer');
    const addAnliegenButton = document.getElementById('add-anliegen-button');
    const inlineNewAnliegenForm = document.getElementById('inline-new-anliegen-form');
    const anliegenKategorieSelect = document.getElementById('anliegen-kategorie');
    const anliegenBeschreibungTextarea = document.getElementById('anliegen-beschreibung');
    const anliegenAbbrechenButton = document.getElementById('anliegen-abbrechen');
    const anliegenBestaetigenButton = document.getElementById('anliegen-bestaetigen');

    const orderNumberList = document.getElementById('order-number-list');
    const newOrderNumberInput = document.getElementById('new-order-number');
    const addOrderNumberButton = document.getElementById('add-order-number-button');
    const selectedOrderNumberDisplay = document.getElementById('selected-order-number-display');
    const backToOrderButton = document.getElementById('back-to-order');

    const anliegenListElement = document.getElementById('anliegen-list');

    const anliegenCategorySpan = document.getElementById('anliegen-category');
    const anliegenDescriptionSpan = document.getElementById('anliegen-description');
    const documentationListElement = document.getElementById('documentation-list');
    const documentationForm = document.getElementById('documentation-form');
    const documentationTextarea = document.getElementById('documentation-text');

    let isLoggedIn = false;
    const validUsername = 'Luca.cardazzone';
    const validPassword = 'Test12345';
    const adminEmail = 'luca.cardazzone@outlook.de'; // Verbesserung 1: E-Mail-Adresse

    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    let selectedCustomerId = null;
    let selectedOrderNumber = null;
    let selectedAnliegenId = null;
    let editingCustomerMode = false;

    // Einstellungen laden
    const savedDarkMode = localStorage.getItem('darkMode') === 'enabled';
    const savedPrimaryColor = localStorage.getItem('primaryColor') || '#007bff';

    if (savedDarkMode) {
        body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
    document.documentElement.style.setProperty('--primary-color', savedPrimaryColor);
    primaryColorPicker.value = savedPrimaryColor;

    const showAppContent = () => {
        loginContainer.style.display = 'none';
        requestAccessContainer.style.display = 'none';
        header.style.display = 'flex';
        content.style.display = 'grid';
        isLoggedIn = true;
    };

    const hideAppContent = () => {
        window.location.href = 'login.html'; // Zurück zum Login-Screen
    };

    const showCustomerDetails = () => {
        customerDetailSidebar.style.display = 'block';
        orderNumberSidebar.style.display = 'block';
        mainArea.style.display = 'flex';
        anliegenDetailsSection.style.display = 'none';
        orderAnliegenSection.style.display = 'none';
        inlineNewAnliegenForm.classList.remove('show');
    };

    const showOrderAnliegen = () => {
        customerDetailSidebar.style.display = 'block';
        orderNumberSidebar.style.display = 'block';
        mainArea.style.display = 'flex';
        anliegenDetailsSection.style.display = 'none';
        orderAnliegenSection.style.display = 'block';
        addAnliegenButton.disabled = !selectedOrderNumber;
        inlineNewAnliegenForm.classList.remove('show');
    };

    const showAnliegenDetails = () => {
        customerDetailSidebar.style.display = 'block';
        orderNumberSidebar.style.display = 'block';
        mainArea.style.display = 'flex';
        anliegenDetailsSection.style.display = 'block';
        orderAnliegenSection.style.display = 'none';
        inlineNewAnliegenForm.classList.remove('show');
    };

    const hideAllDetails = () => {
        customerDetailSidebar.style.display = 'none';
        orderNumberSidebar.style.display = 'none';
        mainArea.style.display = 'none';
        anliegenDetailsSection.style.display = 'none';
        orderAnliegenSection.style.display = 'none';
        inlineNewAnliegenForm.classList.remove('show');
    };

    const renderCustomerSearchResults = (filteredCustomers, searchTerm = '') => {
        customerSearchResultsList.innerHTML = '';
        if (filteredCustomers.length > 0) {
            filteredCustomers.forEach(customer => {
                const listItem = document.createElement('li');
                let displayText = `${customer.vorname} ${customer.nachname} (${customer.email})`;
                if (searchTerm.startsWith('ON:')) {
                    const orderNumber = searchTerm.substring(3);
                    displayText = `${customer.vorname} ${customer.nachname} (Bestellung: ${orderNumber})`;
                }
                listItem.textContent = displayText;
                listItem.addEventListener('click', () => {
                    selectedCustomerId = customer.id;
                    selectedOrderNumber = null; // Reset selected order
                    renderCustomerDetails(customer);
                    renderOrderNumberList(customer);
                    renderAnliegenListForOrder(null); // Clear anliegen
                    showCustomerDetails();
                    customerSearchResultsList.style.display = 'none';
                    customerSearchInput.value = '';
                    if (searchTerm.startsWith('ON:')) {
                        const orderNumber = searchTerm.substring(3);
                        selectOrderNumberInSidebar(orderNumber);
                    }
                });
                customerSearchResultsList.appendChild(listItem);
            });
            customerSearchResultsList.style.display = 'block';
        } else {
            customerSearchResultsList.style.display = 'none';
        }
    };

    const selectOrderNumberInSidebar = (orderNumber) => {
        orderNumberList.querySelectorAll('.order-number-item').forEach(item => {
            if (item.textContent.trim() === orderNumber) {
                item.classList.add('selected');
                selectedOrderNumber = orderNumber;
                selectedOrderNumberDisplay.textContent = selectedOrderNumber;
                renderAnliegenListForOrder(selectedOrderNumber);
                showOrderAnliegen();
            } else {
                item.classList.remove('selected');
            }
        });
    };

    const renderCustomerDetails = (customer) => {
        editingCustomerMode = true;
        customerIdInput.value = customer.id;
        document.getElementById('vorname').value = customer.vorname;
        document.getElementById('nachname').value = customer.nachname;
        document.getElementById('strasse').value = customer.strasse;
        document.getElementById('strassenNummer').value = customer.strassenNummer;
        document.getElementById('telefonnummer').value = customer.telefonnummer;
        document.getElementById('email').value = customer.email;
        deleteCustomerButton.style.display = 'inline-block';
    };

    const clearCustomerForm = () => {
        editingCustomerMode = false;
        customerIdInput.value = '';
        document.getElementById('vorname').value = '';
        document.getElementById('nachname').value = '';
        document.getElementById('strasse').value = '';
        document.getElementById('strassenNummer').value = '';
        document.getElementById('telefonnummer').value = '';
        document.getElementById('email').value = '';
        deleteCustomerButton.style.display = 'none';
    };

    const renderOrderNumberList = (customer) => {
        orderNumberList.innerHTML = '';
        if (customer && customer.orderNumbers) {
            customer.orderNumbers.forEach(orderNumber => {
                const listItemContainer = document.createElement('li');
                listItemContainer.classList.add('order-number-item-container');

                const listItem = document.createElement('div');
                listItem.classList.add('order-number-item');
                listItem.textContent = orderNumber;

                const deleteButton = document.createElement('button');
                deleteButton.classList.add('delete-order-button');
                deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    if (confirm("Sind Sie sicher, dass Sie diese Bestellnummer löschen möchten?")) {
                        customer.orderNumbers = customer.orderNumbers.filter(o => o !== orderNumber);
                        saveCustomersToLocalStorage();
                        renderOrderNumberList(customer);
                        selectedOrderNumber = null;
                        renderAnliegenListForOrder(null);
                        selectedOrderNumberDisplay.textContent = '';
                    }
                });

                listItem.appendChild(deleteButton);
                listItemContainer.appendChild(listItem);

                listItem.addEventListener('click', () => {
                    if (event.target !== deleteButton) {
                        selectedOrderNumber = orderNumber;
                        orderNumberList.querySelectorAll('.order-number-item').forEach(item => item.classList.remove('selected'));
                        listItem.classList.add('selected');
                        selectedOrderNumberDisplay.textContent = selectedOrderNumber;
                        renderAnliegenListForOrder(selectedOrderNumber);
                        showOrderAnliegen();
                    }
                });

                orderNumberList.appendChild(listItemContainer);
            });
        }
    };

    const renderAnliegenListForOrder = (orderNumber) => {
        anliegenListElement.innerHTML = '';
        addAnliegenButton.disabled = true;
        if (selectedCustomerId && orderNumber) {
            const customer = customers.find(c => c.id === selectedCustomerId);
            if (customer && customer.anliegen) {
                customer.anliegen.forEach(anliegen => {
                    if (anliegen.orderNumber === orderNumber) {
                        const listItem = document.createElement('li');
                        listItem.classList.add('claim-item');
                        listItem.innerHTML = `<span>${anliegen.category} - ${anliegen.description.substring(0, 50)}...</span>`;

                        const deleteButton = document.createElement('button');
                        deleteButton.classList.add('delete-order-button');
                        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                        deleteButton.addEventListener('click', (event) => {
                            event.stopPropagation();
                            if (confirm("Sind Sie sicher, dass Sie dieses Anliegen löschen möchten?")) {
                                customer.anliegen = customer.anliegen.filter(a => a.id !== anliegen.id);
                                saveCustomersToLocalStorage();
                                renderAnliegenListForOrder(selectedOrderNumber);
                            }
                        });
                        listItem.appendChild(deleteButton);

                        listItem.addEventListener('click', (event) => {
                            if (event.target !== deleteButton) {
                                selectedAnliegenId = anliegen.id;
                                renderAnliegenDetails(anliegen);
                                showAnliegenDetails();
                            }
                        });
                        anliegenListElement.appendChild(listItem);
                        addAnliegenButton.disabled = false;
                    }
                });
                if (customer.anliegen.filter(anliegen => anliegen.orderNumber === orderNumber).length === 0) {
                    addAnliegenButton.disabled = false;
                }
            }
        } else {
            selectedOrderNumberDisplay.textContent = '';
        }
    };

    const renderAnliegenDetails = (anliegen) => {
        anliegenCategorySpan.textContent = anliegen.category;
        anliegenDescriptionSpan.textContent = anliegen.description;
        renderDocumentationList(anliegen);
    };

    const renderDocumentationList = (anliegen) => {
        documentationListElement.innerHTML = '';
        if (anliegen && anliegen.documentations) {
            anliegen.documentations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            anliegen.documentations.forEach(doc => {
                const listItem = document.createElement('li');
                listItem.classList.add('documentation-item');
                listItem.innerHTML = `
                    <span>${doc.text}</span>
                    <span class="timestamp">${doc.timestamp}</span>
                `;
                documentationListElement.appendChild(listItem);
            });
        }
    };

    const saveCustomersToLocalStorage = () => {
        localStorage.setItem('customers', JSON.stringify(customers));
    };

    const getCurrentTimestamp = () => {
        const now = new Date();
        return now.toLocaleString();
    };

    // --- Event Listeners ---
    header.querySelector('#customerSearch').addEventListener('input', () => {
        const searchTerm = customerSearchInput.value.toLowerCase();
        let filteredCustomers = [];
        if (searchTerm.startsWith('on:')) {
            const orderNumber = searchTerm.substring(3);
            customers.forEach(customer => {
                if (customer.orderNumbers && customer.orderNumbers.includes(orderNumber)) {
                    filteredCustomers.push(customer);
                }
            });
        } else {
            filteredCustomers = customers.filter(customer =>
                customer.vorname.toLowerCase().includes(searchTerm) ||
                customer.nachname.toLowerCase().includes(searchTerm) ||
                customer.email.toLowerCase().includes(searchTerm)
            );
        }
        renderCustomerSearchResults(filteredCustomers, searchTerm);
    });

    header.querySelector('#add-customer-header-button').addEventListener('click', () => {
        clearCustomerForm();
        showCustomerDetails();
    });

    header.querySelector('#settings-button').addEventListener('click', () => {
        settingsScreen.style.display = 'flex';
    });

    settingsScreen.querySelector('#close-settings').addEventListener('click', () => {
        settingsScreen.style.display = 'none';
    });

    settingsScreen.querySelector('#dark-mode-toggle').addEventListener('change', function() {
        body.classList.toggle('dark-mode', this.checked);
        localStorage.setItem('darkMode', this.checked ? 'enabled' : 'disabled');
    });

    settingsScreen.querySelector('#primary-color-picker').addEventListener('input', function() {
        document.documentElement.style.setProperty('--primary-color', this.value);
        localStorage.setItem('primaryColor', this.value);
    });

    customerDetailSidebar.querySelector('#back-to-customers').addEventListener('click', () => {
        selectedCustomerId = null;
        hideAllDetails();
    });

    customerDetailSidebar.querySelector('#customer-form-sidebar').addEventListener('submit', (e) => {
        e.preventDefault();
        const customerId = customerIdInput.value;
        const vorname = document.getElementById('vorname').value;
        const nachname = document.getElementById('nachname').value;
        const strasse = document.getElementById('strasse').value;
        const strassenNummer = document.getElementById('strassenNummer').value;
        const telefonnummer = document.getElementById('telefonnummer').value;
        const email = document.getElementById('email').value;

        let newCustomerId;
        if (editingCustomerMode && selectedCustomerId) {
            const index = customers.findIndex(c => c.id === selectedCustomerId);
            if (index !== -1) {
                customers[index] = { ...customers[index], vorname, nachname, strasse, strassenNummer, telefonnummer, email };
                newCustomerId = selectedCustomerId;
            }
        } else {
            newCustomerId = Date.now().toString();
            const newCustomer = { id: newCustomerId, vorname, nachname, strasse, strassenNummer, telefonnummer, email, orderNumbers: [], anliegen: [] };
            customers.push(newCustomer);
        }

        saveCustomersToLocalStorage();
        clearCustomerForm();
        // Punkt 1: Neuen Kunden direkt öffnen
        const newlyCreatedCustomer = customers.find(c => c.id === newCustomerId);
        if (newlyCreatedCustomer) {
            selectedCustomerId = newlyCreatedCustomer.id;
            renderCustomerDetails(newlyCreatedCustomer);
            renderOrderNumberList(newlyCreatedCustomer);
            renderAnliegenListForOrder(null);
            showCustomerDetails();
        }
    });

    customerDetailSidebar.querySelector('#delete-customer').addEventListener('click', () => {
        if (selectedCustomerId && confirm("Möchten Sie diesen Kunden wirklich löschen?")) {
            customers = customers.filter(c => c.id !== selectedCustomerId);
            saveCustomersToLocalStorage();
            clearCustomerForm();
            selectedCustomerId = null;
            hideAllDetails();
        }
    });

    orderNumberSidebar.querySelector('#add-order-number-button').addEventListener('click', () => {
        const newOrderNumber = newOrderNumberInput.value.trim();
        if (newOrderNumber && selectedCustomerId) {
            const customer = customers.find(c => c.id === selectedCustomerId);
            if (customer) {
                if (!customer.orderNumbers) {
                    customer.orderNumbers = [];
                }
                if (!customer.orderNumbers.includes(newOrderNumber)) {
                    customer.orderNumbers.push(newOrderNumber);
                    saveCustomersToLocalStorage();
                    renderOrderNumberList(customer);
                    newOrderNumberInput.value = '';
                } else {
                    alert("Diese Bestellnummer existiert bereits für diesen Kunden.");
                }
            }
        }
    });

    mainArea.querySelector('#add-anliegen-button').addEventListener('click', () => {
        inlineNewAnliegenForm.classList.toggle('show');
    });

    mainArea.querySelector('#inline-new-anliegen-form #anliegen-abbrechen').addEventListener('click', () => {
        inlineNewAnliegenForm.classList.remove('show');
    });

    mainArea.querySelector('#inline-new-anliegen-form #anliegen-bestaetigen').addEventListener('click', () => {
        const category = anliegenKategorieSelect.value;
        const description = anliegenBeschreibungTextarea.value;

        if (description) {
            const newAnliegen = { id: Date.now().toString(), orderNumber: selectedOrderNumber, category, description, documentations: [] };
            const customer = customers.find(c => c.id === selectedCustomerId);
            if (customer) {
                if (!customer.anliegen) {
                    customer.anliegen = [];
                }
                customer.anliegen.push(newAnliegen);
                saveCustomersToLocalStorage();
                renderAnliegenListForOrder(selectedOrderNumber);
                inlineNewAnliegenForm.classList.remove('show');
                anliegenBeschreibungTextarea.value = '';
            }
        } else {
            alert("Bitte geben Sie eine Beschreibung für das Anliegen ein.");
        }
    });

    mainArea.querySelector('#order-anliegen-section #back-to-customer-from-order').addEventListener('click', () => {
        showCustomerDetails();
    });

    mainArea.querySelector('#anliegen-details-section #back-to-order').addEventListener('click', () => {
        showOrderAnliegen();
    });

    mainArea.querySelector('#documentation-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const documentationText = documentationTextarea.value;
        if (selectedCustomerId && selectedAnliegenId) {
            const customer = customers.find(c => c.id === selectedCustomerId);
            if (customer) {
                const anliegen = customer.anliegen.find(a => a.id === selectedAnliegenId);
                if (anliegen) {
                    anliegen.documentations.push({ text: documentationText, timestamp: getCurrentTimestamp() });
                    saveCustomersToLocalStorage();
                    renderDocumentationList(anliegen);
                    documentationTextarea.value = '';
                }
            }
        }
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.header-actions')) {
            customerSearchResultsList.style.display = 'none';
        }
        if (!event.target.closest('#add-anliegen-button') && !event.target.closest('#inline-new-anliegen-form')) {
            inlineNewAnliegenForm.classList.remove('show');
        }
        if (!event.target.closest('#settings-button') && !event.target.closest('#settings-content')) {
            settingsScreen.style.display = 'none';
        }
    });

    // Initiales Rendering Setup
    const storedCustomers = localStorage.getItem('customers');
    if (storedCustomers) {
        customers = JSON.parse(storedCustomers);
    }
    // Überprüfen, ob der Benutzer eingeloggt ist
    if (localStorage.getItem('isLoggedIn') === 'true') {
        showAppContent();
    } else {
        hideAppContent();
    }
});