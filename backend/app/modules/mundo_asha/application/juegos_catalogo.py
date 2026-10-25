"""Contenido básico versionado. Respuestas comprobadas por API; sin evaluación clínica."""
VERSION = "basica-1"
XP_NIVEL = 100
XP_MEDALLA = 100
XP_POR_NIVEL_PERFIL = 200


def nivel(title, prompt, choices, answer, sequence=False):
    return dict(title=title, prompt=prompt, choices=choices, answer=answer, sequence=sequence)


MUNDOS = {
    "HABLA": dict(name="Taller de los Sonidos", description="Habla y articulación: identifica palabras y sonidos en actividades básicas.", levels=[
        nivel("Escucha la palabra", "Escucha: mesa. ¿Qué palabra oíste?", ["Casa", "Mesa", "Sapo"], ["Mesa"]),
        nivel("Encuentra el sonido", "Mesa empieza con eme. ¿Cuál también empieza con eme?", ["Luna", "Sol", "Mano"], ["Mano"]),
        nivel("Una frase sonora", "Ordena estas palabras: mi mamá me mima.", ["Mima", "Mi", "Mamá", "Me"], ["Mi", "Mamá", "Me", "Mima"], True),
    ]),
    "LENGUAJE": dict(name="La Isla de las Palabras", description="Comprensión y expresión: resuelve pistas y ordena una historia.", levels=[
        nivel("Una pista", "Tiene cuatro patas, dice miau y le gusta dormir. ¿Qué animal es?", ["Perro", "Gato", "Pez"], ["Gato"]),
        nivel("Comprende la historia", "Ana lleva un paraguas porque llueve. ¿Para qué lo usa?", ["Para comer", "Para dormir", "Para protegerse de la lluvia"], ["Para protegerse de la lluvia"]),
        nivel("Cuenta en orden", "Primero despertamos, después desayunamos y luego salimos. Elige las acciones en ese orden.", ["Salir", "Despertar", "Desayunar"], ["Despertar", "Desayunar", "Salir"], True),
    ]),
    "FLUIDEZ": dict(name="Ritmo de las Palabras", description="Fluidez: reconoce pausas y turnos de conversación.", levels=[
        nivel("Escucha las pausas", "Escucha: uno, pausa, dos, pausa, tres. ¿Cuántas pausas hay?", ["Una", "Dos", "Tres"], ["Dos"]),
        nivel("Tu turno", "Tu amiga está contando algo. ¿Qué puedes hacer para respetar su turno?", ["Escuchar hasta que termine", "Hablar encima", "Interrumpir siempre"], ["Escuchar hasta que termine"]),
        nivel("Ordena la conversación", "Ordena: escuchar, esperar el turno y responder.", ["Responder", "Escuchar", "Esperar"], ["Escuchar", "Esperar", "Responder"], True),
    ]),
    "VOZ": dict(name="El Estudio de la Voz", description="Voz y habla: practica la pronunciación y entonación de frases con dificultad progresiva.", levels=[
        nivel("Frases breves", "Pronuncia la frase en voz alta: «El perro corre».", ["El perro corre"], ["El perro corre"]),
        nivel("Frases descriptivas", "Pronuncia la frase en voz alta: «El gato duerme sobre la cama».", ["El gato duerme sobre la cama"], ["El gato duerme sobre la cama"]),
        nivel("Oraciones de longitud media", "Pronuncia la frase en voz alta: «El niño guarda sus juguetes después de jugar».", ["El niño guarda sus juguetes después de jugar"], ["El niño guarda sus juguetes después de jugar"]),
        nivel("Oraciones más elaboradas", "Pronuncia la frase en voz alta: «El perro corre hacia su casa porque empieza a llover».", ["El perro corre hacia su casa porque empieza a llover"], ["El perro corre hacia su casa porque empieza a llover"]),
        nivel("Oraciones extensas", "Pronuncia la frase en voz alta: «Cuando termina sus tareas, el niño ordena sus libros y prepara la mochila para el día siguiente».", ["Cuando termina sus tareas, el niño ordena sus libros y prepara la mochila para el día siguiente"], ["Cuando termina sus tareas, el niño ordena sus libros y prepara la mochila para el día siguiente"]),
    ]),
    "OROFACIAL": dict(name="Laboratorio de los Gestos", description="Motricidad orofacial: reconoce labios y lengua en preguntas ilustrativas.", levels=[
        nivel("Conoce los labios", "¿Qué parte de la cara se junta al decir eme?", ["Los labios", "Las cejas", "Las orejas"], ["Los labios"]),
        nivel("Conoce la lengua", "¿Qué parte de la boca ayuda a formar distintos sonidos del habla?", ["La lengua", "La nariz", "Las pestañas"], ["La lengua"]),
        nivel("Reconoce un gesto", "Al decir pe, los labios se juntan y después se separan. ¿Qué parte participa?", ["Las orejas", "Los labios", "Las cejas"], ["Los labios"]),
    ]),
}


def catalogo():
    return [dict(id=key, version=VERSION, name=world["name"], description=world["description"],
                 levels=[dict(number=i + 1, **{k: v for k, v in level.items() if k != "answer"})
                         for i, level in enumerate(world["levels"])]) for key, world in MUNDOS.items()]


def catalogo_publico():
    """Información descriptiva: los ejercicios sólo viajan por el progreso autorizado."""
    return [dict(id=key, version=VERSION, name=w["name"], description=w["description"],
                 levels=[dict(number=i + 1) for i in range(len(w["levels"]))])
            for key, w in MUNDOS.items()]
