function enqueueProcess() {
    const processInput = $('#process-input');
    const prioritySelect = $('#priority-select');

    const process = processInput.val();
    const priority = prioritySelect.val();

    if (process) {
        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: '/enqueue',
            data: JSON.stringify({ process, priority }),
            success: function(response) {
                processInput.val('');
                updateQueues();
                updateLogTable('Enqueue', process, priority);
            }
        });
    }
}

function dequeueProcess() {
    $.ajax({
        type: 'GET',
        url: '/dequeue',
        success: function(response) {
            if (response.process) {
                alert(`Dequeued process: ${response.process}`);
                updateQueues();
                updateLogTable('Dequeue', response.process);
            } else {
                alert('No process to dequeue');
            }
        }
    });
}


// Update the updateVisualization function
function updateVisualization() {
    // Update queues visualization
    for (const priority in queues) {
        const queueVisual = $(`#${priority}-queue-visual`);
        queueVisual.empty();
        displayQueueVisual(`${priority} Queue`, queues[priority], queueVisual);
    }

    // Display waiting times
    const waitingTimesVisual = $('#waiting-times-visual');
    waitingTimesVisual.empty();
    for (const process in waiting_times) {
        waitingTimesVisual.append(`<div>${process}: ${waiting_times[process]}</div>`);
    }

    // Update seconds indicator
    const secondsIndicator = $('#seconds-indicator');
    const seconds = new Date().getSeconds();
    secondsIndicator.text(`${seconds}s`);
}

// Update the displayQueueVisual function
function displayQueueVisual(queueName, processes, visualElement) {
    visualElement.append(`<div>${queueName}</div>`);
    for (const process of processes) {
        const waitingTime = waiting_times[process] || 0; // Default to 0 if waiting time is undefined
        visualElement.append(`<div class="process-visual">
            <span>${process}</span>
            <span class="waiting-time">(${waitingTime}s)</span>
        </div>`);
    }
}


function displayWaitingTimes(waitingTimes) {
    const waitingTimesElement = $("#waiting-times");
    waitingTimesElement.empty();
    for (const process in waitingTimes) {
      waitingTimesElement.append(
        `<div class="waiting-time">${process}: ${waitingTimes[process]}</div>`
      );
    }
  }

  function updateRealTimeWaitingTimes() {
    setInterval(function () {
      $.get("/waiting_times", function (response) {
        displayWaitingTimes(response);
      });
    }, 1000); // Update every 1 second (adjust as needed)
  }
