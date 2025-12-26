# Dashboard de Organigrama Interactivo

Un dashboard moderno y flexible para organizar un organigrama de manera visual e interactiva. Permite gestionar personas y departamentos con arrastre de ratón/dedo.

## Características

✨ **Gestión de Personas**
- Agregar personas con nombre y privilegio
- Editar y eliminar personas
- Vista visual de personas asignadas a departamentos

📋 **Gestión de Departamentos**
- Crear departamentos dinámicamente en el canvas
- Arrastrar y redimensionar departamentos
- Editar nombre de departamentos
- Contador automático de personas por departamento

🎯 **Drag & Drop Avanzado**
- Arrastrar personas desde el panel lateral a departamentos
- Reasignar personas entre múltiples departamentos
- Desasignar personas arrastrando fuera del departamento
- Soporte para mouse y touch (móvil/tablet)

💾 **Persistencia**
- Datos guardados automáticamente en IndexedDB
- Sin necesidad de backend
- Los cambios persisten al cerrar/reabrir el navegador

🎨 **Diseño Minimalista**
- Interfaz limpia y profesional
- Tema claro/oscuro automático según preferencias del sistema
- Responsive para dispositivos móviles

## Requisitos

- Node.js 20.19+ o 22.12+
- npm o yarn

## Instalación

```bash
npm install
```

## Desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173/`

## Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`.

## Estructura del Proyecto

```
src/
├── components/
│   ├── layout/          # Layout principal (Dashboard, Sidebar)
│   ├── person/          # Componentes de personas (Form, Card, List)
│   ├── department/      # Componentes de departamentos (Department, Canvas, etc.)
│   └── common/          # Componentes reutilizables
├── hooks/              # Hooks personalizados (usePersons, useDepartments, useAssignments)
├── db/                 # Configuración de IndexedDB (Dexie)
├── types/              # Tipos TypeScript
├── styles/             # Estilos CSS
└── utils/              # Utilidades (UUID, constantes)
```

## Cómo Usar

### Agregar una Persona

1. En el panel lateral izquierdo, completa los campos "Nombre" y "Privilegio"
2. Haz clic en "Agregar Persona"
3. La persona aparecerá en la lista

### Crear un Departamento

1. En el área de trabajo (derecha), haz clic en "+ Nuevo Departamento"
2. Se creará un departamento que puedes mover y redimensionar
3. Edita el nombre haciendo clic en el título

### Asignar una Persona a un Departamento

1. Arrastra una persona desde el panel lateral
2. Suéltala dentro de un departamento
3. La persona ahora aparecerá dentro del departamento y su tarjeta en el sidebar se mostrará con color tenue

### Asignar a Múltiples Departamentos

1. Una persona puede estar en múltiples departamentos simultáneamente
2. Arrastra la misma persona a diferentes departamentos
3. Verás un número que indica en cuántos departamentos está asignada

### Desasignar de un Departamento

1. Arrastra una persona fuera de su departamento actual
2. Solo se desasignará de ese departamento (mantendrá sus otras asignaciones)

### Editar Departamento

- **Nombre**: Haz clic en el título del departamento para editar
- **Posición**: Arrastra el departamento dentro del canvas
- **Tamaño**: Arrastra las esquinas/bordes para redimensionar
- **Eliminar**: Haz clic en el ícono 🗑️ (las personas NO se eliminarán, solo se desasignarán)

## Tecnologías Utilizadas

- **React 19** - Framework UI
- **TypeScript** - Lenguaje tipado
- **Vite** - Build tool rápido
- **Dexie** - Librería para IndexedDB
- **@dnd-kit** - Sistema moderno de drag & drop
- **react-rnd** - Componentes draggables y redimensionables
- **CSS Variables** - Estilos minimalistas y mantenibles

## Soporte

Si encuentras problemas o tienes sugerencias, por favor abre un issue en el repositorio.
