const express = require('express');
const fs = require("fs");
const MIN_ID = 1
const MAX_ID = 3

// MANEJO DE ARCHIVOS
class Contenedor {
    constructor(_nombre) {
        this.nombre = _nombre;
    }

    async save(_content) {
        const existingContent = await this.read()

        if (!existingContent) {
            //CREAR EL ARCHIVO E INSERTAR EL PRIMER ELEMENTO
            try {
                await fs.promises.writeFile(`./${this.nombre}.txt`, JSON.stringify([{
                    id: 1,
                    ..._content,
                }]));
            } catch (err) {
                console.log(err);
            }

        } else {
            //AGREGAR AL CONTENIDO DEL ARCHIVO EXISTENTE
            const existingContentParsed = JSON.parse(existingContent)

            let newItemId = 1;
            if (existingContentParsed.length > 0) { //To prevent insert error after deleteAll
                newItemId = parseInt(existingContentParsed[existingContentParsed.length - 1]['id'] + 1)
            }

            const newContent = [...existingContentParsed, {
                id: newItemId,
                ..._content,
            }]
    
            try {
                await fs.promises.writeFile(`./${this.nombre}.txt`, JSON.stringify(newContent))
                return newItemId
            } catch (err) {
                console.log(err);
            }

        }
        
    }

    async read() {
        try {
            const data = await fs.promises.readFile(`./${this.nombre}.txt`, "utf-8");
            return data
        } catch (err) {
            console.log(err)
            return null
        }
    }

    async getById(_id) {
        const existingContent = await this.read()
        if (!existingContent)
            return "El archivo no existe"
        else {
            const existingContentParsed = JSON.parse(existingContent)
            const found = existingContentParsed.find(el => el.id === _id);
            if (found) {
                console.log(`Item id: ${_id}:`, found)
                return found
            }
            else {
                console.log(`Item id: ${_id} no fue encontrado`)
                return null
            }
        }
    }

    async getAll() {
        const existingContent = await this.read()
        if (!existingContent)
            return "El archivo no existe"
        else {
            console.log(JSON.parse(existingContent))
            return JSON.parse(existingContent)
        }
    }

    async deleteById(_id) {
        const existingContent = await this.read()
        if (!existingContent)
            return "El archivo no existe"
        else {
            //CREAR NUEVO ARRAY, SIN EL ID SELECCIONADO 
            const existingContentParsed = JSON.parse(existingContent)
            const result = existingContentParsed.filter(el => el.id !== _id);

            if (result) {       
                try {
                    await fs.promises.writeFile(`./${this.nombre}.txt`, JSON.stringify(result))
                } catch (err) {
                    console.log(err);
                }
            }
            else {
                console.log(`Item id: ${_id} no fue encontrado`)
            }
        }
    }

    async deleteAll() {
        await fs.promises.writeFile(`./${this.nombre}.txt`, JSON.stringify([]))
    }
}

// INICIAR SERVIDOR
const app = express();
const server = app.listen(8080, () => {
    console.log(`Servidor iniciado en puerto ${server.address().port}`);
})
// MANEJO DE ERRORES SERVIDOR
server.on("error", (e) => console.log(e))

// AUX
const productos = new Contenedor("productos");

// ENDPOINTS

app.get("/", (req, res) => {
    res.send({mensaje: " Hola mundo"})
})

app.get("/productos", async (req, res) => {
    const productosGet = await productos.getAll();
    res.send(productosGet)
})

app.get("/productoRandom", async (req, res) => {
    const productoGet = await productos.getById(Math.floor(Math.random() * (MAX_ID - MIN_ID + 1) + MIN_ID))
    res.send(productoGet)
})