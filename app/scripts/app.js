var client;

(async function init() {
  client = await app.initialized();
  client.events.on('app.activated', fetchTicketFields);
})();

async function fetchTicketFields() {
  try {
    const response = await client.request.invokeTemplate('getTicketFields', {});
    const ticketFields = JSON.parse(response.response);
    console.log('API response:', ticketFields);
    const requiredFields = ticketFields.filter(field => field.required_for_agents);
    renderFields(requiredFields);
  } catch (error) {
    console.error('Error fetching ticket fields:', error);
    client.interface.trigger("showNotify", {
      type: "error",
      message: "Failed to fetch ticket fields: " + error.status
    });
  }
}

function renderFields(fields) {
  const formContainer = document.getElementById('form-container');
  formContainer.innerHTML = '';
  fields.forEach(field => {
    const fieldElement = document.createElement('div');
    switch(field.name) {
      case 'requester':
        fieldElement.innerHTML = `
          <label for="requester">Requester Email</label>
          <input type="email" id="requester" name="requester" required>
        `;
        break;
      case 'subject':
        fieldElement.innerHTML = `
          <label for="subject">Subject</label>
          <input type="text" id="subject" name="subject" required>
        `;
        break;
      case 'description':
        fieldElement.innerHTML = `
          <label for="description">Description</label>
          <textarea id="description" name="description" required></textarea>
        `;
        break;
      case 'priority':
        fieldElement.innerHTML = `
          <label for="priority">Priority</label>
          <select id="priority" name="priority" required>
            <option value="1">Low</option>
            <option value="2">Medium</option>
            <option value="3">High</option>
            <option value="4">Urgent</option>
          </select>
        `;
        break;
      case 'status':
        fieldElement.innerHTML = `
          <label for="status">Status</label>
          <select id="status" name="status" required>
            <option value="2">Open</option>
            <option value="3">Pending</option>
            <option value="4">Resolved</option>
            <option value="5">Closed</option>
          </select>
        `;
        break;
      case 'company':
        fieldElement.innerHTML = `
          <label for="company">Company</label>
          <input type="text" id="company" name="company">
        `;
        break;
      default:
        break;
    }
    formContainer.appendChild(fieldElement);
  });
  document.getElementById('submit-button').addEventListener('click', handleSubmit);
}

async function handleSubmit() {
  const formData = {};
  document.querySelectorAll('input').forEach(input => {
    formData[input.name] = input.value;
  });
  document.querySelectorAll('textarea').forEach(textarea => {
    formData[textarea.name] = textarea.value;
  });
  document.querySelectorAll('select').forEach(select => {
    formData[select.name] = select.value;
  });
  try {
    
    await client.interface.trigger('showDialog', {
      title: 'Confirmation création de Ticket',
      template: 'ConfirmDialog.html',
    });

    var content = JSON.stringify(formData, null, 2); 
    console.log('contenu :' + content);
    document.getElementById('formData').innerText = content; 

    document.getElementById('confirmButton').addEventListener('click', createTicket(formData));
  } catch (error) {
    client.interface.trigger("showNotify", {
      type: "error",
      message: "Notification dialog failed to create"
    });
  }
}


async function createTicket(data) {
  const ticketData = {
    "email": data.requester,
    "subject": data.subject,
    "description": data.description,
    "priority": data.priority,
    "status": data.status,
    "company_id": data.company
  };

  try {
    await client.request.invokeTemplate('createTicket', {
      body: JSON.stringify(ticketData)
    });

    client.interface.trigger("showNotify", {
      type: "success",
      message: "Ticket created successfully"
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    client.interface.trigger("showNotify", {
      type: "error",
      message: "Failed to create ticket"
    });
  }
}
