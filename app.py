from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

log = []

# Define three priority queues
queues = {
    'high': [],
    'medium': [],
    'low': [],
}

# Define a dictionary to store process waiting times
waiting_times = {}


priority_boost_log = []


def enqueue_process(priority, process):
    queues[priority].append(process)
    waiting_times[process] = 0  # Initialize waiting time for the new process


def dequeue_process():
    for priority in ['high', 'medium', 'low']:
        if queues[priority]:
            return queues[priority].pop(0), priority
    return None, None


def boost_priority(process, from_priority, to_priority):
    queues[to_priority].append(
        {'process': process, 'waiting_time': waiting_times[process]})
    update_log_table('Priority Boost', process, to_priority)
    priority_boost_log.append(
        f"Boosted {process} from {from_priority} to {to_priority}")


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/enqueue', methods=['POST'])
def enqueue():
    data = request.get_json()
    priority = data['priority']
    process = data['process']

    # Update the waiting time when enqueueing
    waiting_times[process] = 0

    queues[priority].append(
        {'process': process, 'waiting_time': waiting_times[process]})
    # enqueue_process(priority, process)

    update_log_table('Enqueue', process, priority)

    return jsonify(success=True)


@app.route('/waiting_times')
def get_waiting_times():
    return jsonify(waiting_times)


@app.route('/dequeue')
def dequeue():
    process, priority = dequeue_process()
    if process:
        update_log_table('Dequeue', process, priority)
    return jsonify(process=process)


@app.route('/queues')
def get_queues():
    return jsonify(high=queues['high'], medium=queues['medium'], low=queues['low'])


@app.route('/log')
def get_log():
    return jsonify(log=log)


def update_log_table(action, process, priority):
    log.insert(0, {'action': action, 'process': process, 'priority': priority})
    if len(log) > 10:  # Limit the log to the last 10 actions
        log.pop()


def update_waiting_times():
    for process in waiting_times:
        waiting_times[process] += 1


if __name__ == '__main__':
    app.run(debug=True)
