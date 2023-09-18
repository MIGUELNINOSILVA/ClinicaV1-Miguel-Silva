const express = require("express");
const routes = express.Router();
const { MongoClient } = require("mongodb");
require("dotenv").config();

const bases = process.env.MONGO_URI;
const nombreBase = process.env.NOMBRE_BASE;

// 1. Obtener todos los pacientes de manera alfabética
routes.get("/ejercicio1", async (req, res) => {
  try {
    const client = await MongoClient.connect(bases);
    const db = client.db(nombreBase);
    const collection = db.collection("Usuario");
    const result = await collection
      .find()
      .sort({
        usu_nombre: 1,
      })
      .toArray();
    res.json({
      description: "Obtener todos los pacientes de manera alfabética",
      lenghtResults: result.length,
      results: result,
    });
    res.status(200);
    client.close();
  } catch (e) {
    res.json({
      message: "No found",
    });
    res.status(404);
  }
});

//2. Obtener las citas de una fecha en específico , donde se ordene los pacientes de manera alfabética.
routes.get("/ejercicio2", async (req, res) => {
  try {
    const client = await MongoClient.connect(bases);
    const db = client.db(nombreBase);
    const collection = db.collection("Cita");
    const result = await collection
      .aggregate([
        {
          $match: {
            cit_fecha: "2023-01-01",
          },
        },
        {
          $lookup: {
            from: "Usuario", // Nombre de la colección de usuarios
            localField: "cit_datos_usuario",
            foreignField: "usu_id",
            as: "usuario",
          },
        },
        {
          $unwind: "$usuario",
        },
        {
          $sort: {
            "usuario.usu_nombre": 1,
          },
        },
      ])
      .toArray();

    res.json({
      description:
        "Obtener las citas de una fecha en específico, donde se ordenen los pacientes de manera alfabética.",
      lengthResults: result.length,
      results: result,
    });
    res.status(200);
    client.close();
  } catch (e) {
    res.json({
      message: "No encontrado",
    });
    res.status(404);
  }
});


// 3.Obtener todos los médicos de una especialidad en específico (por ejemplo, ‘Cardiología’).
routes.get("/ejercicio3", async (req, res) => {
  try {
    const client = await MongoClient.connect(bases);
    const db = client.db(nombreBase);
    const collection = db.collection("Medico");
    const result = await collection
      .aggregate([
        {
          $lookup: {
            from: "Especialidad",
            localField: "med_especialidad",
            foreignField: "esp_id",
            as: "especialidad",
          },
        },
        {
          $unwind: "$especialidad",
        },
        {
          $match: {
            "especialidad.esp_nombre": "Cardiología",
          },
        },
        {
          $project: {
            _id: 0,
            me_nro_matricula_profesional: 1,
            med_nombre_completo: 1,
            med_consultorio: 1,
            "especialidad.esp_nombre": 1,
          },
        },
      ])
      .toArray();
    res.json({
      description:
        "Obtener las citas de una fecha en específico, donde se ordenen los pacientes de manera alfabética.",
      lengthResults: result.length,
      results: result,
    });
    res.status(200);
    client.close();
  } catch (e) {
    res.json({
      message: "No encontrado",
    });
    res.status(404);
  }
});

// 4. Encontrar la próxima cita para un paciente en específico (por ejemplo, el paciente con user_id 1).
routes.get("/ejercicio4", async (req, res) => {
  try {
    const client = await MongoClient.connect(bases);
    const db = client.db(nombreBase);
    const collection = db.collection("Cita");
    // const result = await collection.find({cit_datos_usuario: 1005236051}).sort({cit_fecha:1}).limit(1).toArray();
    const result = await collection.aggregate([
      {
        $match: {
          cit_datos_usuario: 1005236051
        },
      },
      {
        $sort: {
          cit_fecha: 1,
        },
      },
      {
        $limit: 1,
      },
      {
        $lookup: {
          from: "Usuario", 
          localField: "cit_datos_usuario",
          foreignField: "usu_id",
          as: "usuario",
        },
      },
      {
        $unwind: "$usuario",
      },
      {
        $project: {
          _id: 0,
          cit_codigo: 1,
          cit_fecha: 1,
          cit_estado_cita: 1,
          cit_medico: 1,
          "usuario.usu_nombre": 1, 
          "usuario.usu_segundo_nombre": 1, 
          "usuario.usu_primer_apellido": 1, 
          "usuario.usu_segundo_apellido": 1, 
        },
      },
    ]).toArray();
    

    res.json({
      description:
        "Encontrar la próxima cita para un paciente en específico (por ejemplo, el paciente con user_id 1).",
      lengthResults: result.length,
      results: result,
    });
    res.status(200);
    client.close();
  } catch (e) {
    res.json({
      message: "No encontrado",
    });
    res.status(404);
  }
});

//5. Encontrar todos los pacientes que tienen citas con un médico en específico (por ejemplo, el médico con med_numMatriculaProfesional 1).
routes.get('/ejercicio5', async (req, res) => {
  try {
    const client = await MongoClient.connect(bases);
    const db = client.db(nombreBase);
    const collection = db.collection("Cita"); 
    const result = await collection.aggregate([
      {
        $match: {
          cit_medico: 1,
        },
      },
      {
        $sort: {
          cit_fecha: 1,
        },
      },
      {
        $lookup: {
          from: "Usuario",
          localField: "cit_datos_usuario",
          foreignField: "usu_id",
          as: "Pacientes", // Corregido el alias
        },
      },
      {
        $unwind: "$Pacientes", // Corregido el alias
      },
      {
        $project: {
          _id: 0,
          cit_codigo: 1,
          cit_fecha: 1,
          cit_estado_cita: 1,
          cit_medico: 1,
          "Pacientes.usu_nombre": 1,
          "Pacientes.usu_segundo_nombre": 1,
          "Pacientes.usu_primer_apellido": 1,
          "Pacientes.usu_segundo_apellido": 1,
        },
      },
    ]).toArray();
    

    res.json({
      description: "Encontrar tod  os los pacientes que tienen citas con un médico en específico.",
      lengthResults: result.length,
      results: result,
    });

    res.status(200);
    client.close();
  } catch (e) {
    res.json({
      message: "No encontrado",
    });
    res.status(404);
  }
});

module.exports = routes;
