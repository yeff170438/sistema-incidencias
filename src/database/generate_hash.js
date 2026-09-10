const bcrypt = require('bcrypt');

(async () => {
    const password = '12345'; // Cambia esta contraseña si deseas
    const hash = await bcrypt.hash(password, 10);

    console.log(hash);
})(); 