const socket = io();

socket.on('connect', () => {
    const params = { username: 'John', Galaxy: 'Shadowfire' }; // TODO: Get account Username and Galaxy 

    socket.emit('webLogin', params, (err) => {
        if (err) {
            // send error to client / console.log(err);
            window.location.href = '/';
        } else {
            // Good To Go!
        }
    });
});

socket.on('disconnect', () => {
    // TODO: Do Something on Disconnect from web?
});

socket.on('updateUserList', (users) => {
    const ol = jQuery('<ul></ul>');

    users.forEach((user) => {
        ol.append(jQuery('<li></li>').text(user));
    });

    jQuery('#users').html(ol);
});