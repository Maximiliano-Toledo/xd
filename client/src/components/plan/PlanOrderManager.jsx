import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MdDragHandle, MdSubdirectoryArrowLeft, MdSave, MdRefresh } from 'react-icons/md';
import { FaEye, FaEyeSlash, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import HeaderStaff from '../../layouts/HeaderStaff';
import { Footer } from '../../layouts/Footer';
import { useAbmApi } from '../../hooks/useAbmApi';
import '../../styles/dashboard-plan.css';
import '../../styles/panel-usuario-nuevo.css';

// Componente individual sorteable para cada plan
const SortablePlanItem = ({ plan, index, onMoveUp, onMoveDown, totalItems }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: plan.id_plan.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`plan-item ${isDragging ? 'dragging' : ''}`}
    >
      <div className="plan-item-content">
        {/* Handle para arrastrar */}
        <div
          {...attributes}
          {...listeners}
          className="drag-handle"
          title="Arrastra para reordenar"
        >
          <MdDragHandle />
        </div>

        {/* Número de orden */}
        <div className="plan-order">
          #{index + 1}
        </div>

        {/* Información del plan */}
        <div className="plan-info">
          <h5 className="plan-name">{plan.nombre}</h5>
          <div className="plan-details">
            <span className={`plan-status ${plan.estado === 'Activo' ? 'active' : 'inactive'}`}>
              {plan.estado === 'Activo' ? (
                <>
                  <FaEye className="me-1" />
                  Visible
                </>
              ) : (
                <>
                  <FaEyeSlash className="me-1" />
                  Oculto
                </>
              )}
            </span>
            <span className="plan-id">ID: {plan.id_plan}</span>
          </div>
        </div>

        {/* Controles de movimiento */}
        <div className="plan-controls">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            title="Mover hacia arriba"
          >
            <FaArrowUp />
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => onMoveDown(index)}
            disabled={index === totalItems - 1}
            title="Mover hacia abajo"
          >
            <FaArrowDown />
          </button>
        </div>
      </div>
    </div>
  );
};

const PlanOrderManager = () => {
  const navigate = useNavigate();
  const { data: planes, loading, getAll: getPlanes, updatePlanOrder } = useAbmApi('planes');

  const [orderedPlanes, setOrderedPlanes] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Configurar sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Cargar planes al montar el componente
  useEffect(() => {
    getPlanes();
  }, []);

  // Actualizar lista ordenada cuando cambian los planes
  useEffect(() => {
    if (planes && planes.length > 0) {
      // Ordenar por campo 'orden' si existe, si no por id
      const sorted = [...planes].sort((a, b) => {
        const orderA = a.orden || a.id_plan;
        const orderB = b.orden || b.id_plan;
        return orderA - orderB;
      });
      setOrderedPlanes(sorted);
    }
  }, [planes]);

  const handleVolver = () => {
    if (hasChanges) {
      Swal.fire({
        title: '¿Descartar cambios?',
        text: 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#64A70B',
        confirmButtonText: 'Sí, descartar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(-1);
        }
      });
    } else {
      navigate(-1);
    }
  };

  // Manejar el drag and drop
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setOrderedPlanes((items) => {
        const oldIndex = items.findIndex((item) => item.id_plan.toString() === active.id);
        const newIndex = items.findIndex((item) => item.id_plan.toString() === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return newOrder;
      });
    }
  };

  // Mover plan hacia arriba
  const moveUp = (index) => {
    if (index === 0) return;

    const newOrder = [...orderedPlanes];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setOrderedPlanes(newOrder);
    setHasChanges(true);
  };

  // Mover plan hacia abajo
  const moveDown = (index) => {
    if (index === orderedPlanes.length - 1) return;

    const newOrder = [...orderedPlanes];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setOrderedPlanes(newOrder);
    setHasChanges(true);
  };

  // Guardar cambios
  const handleSaveOrder = async () => {
    if (!hasChanges) {
      Swal.fire({
        title: 'Sin cambios',
        text: 'No hay cambios para guardar',
        icon: 'info',
        confirmButtonColor: '#64A70B'
      });
      return;
    }

    setSaving(true);
    try {
      // Crear array con el nuevo orden
      const orderData = orderedPlanes.map((plan, index) => ({
        id_plan: plan.id_plan,
        orden: index + 1
      }));

      // Llamar a la API para actualizar el orden
      await updatePlanOrder(orderData);

      Swal.fire({
        title: '¡Orden actualizado!',
        text: 'El orden de los planes se ha guardado correctamente',
        icon: 'success',
        confirmButtonColor: '#64A70B'
      });

      setHasChanges(false);
      // Recargar los planes para obtener el orden actualizado
      await getPlanes();
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo guardar el orden de los planes',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setSaving(false);
    }
  };

  // Restablecer orden original
  const handleResetOrder = () => {
    Swal.fire({
      title: '¿Restablecer orden?',
      text: 'Esto restablecerá el orden original de los planes',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FFC107',
      cancelButtonColor: '#64A70B',
      confirmButtonText: 'Sí, restablecer',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        getPlanes();
        setHasChanges(false);
      }
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <HeaderStaff />

      <h1 className="w-50 fs-4 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 ms-4 me-4">
        Gestión del Orden de Planes
      </h1>

      <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
        <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5 ms-4 me-4">
          <h6 className="fs-3 h1-titulo fw-bold">
            Organiza el orden en que aparecen los planes en el formulario de búsqueda
          </h6>
          <p className="text-muted">
            Arrastra y suelta los planes para cambiar su orden, o usa los botones de flecha para moverlos.
          </p>
        </div>
      </div>

      <div className="d-flex justify-content-center align-items-start min-vh-50 mt-4">
        <div className="w-100 d-flex flex-column border shadow-input p-4 rounded-3 shadow mx-4 mb-4">

          {/* Controles superiores */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <h4 className="mb-0 subtitle-dashboard">Lista de Planes</h4>
              {hasChanges && (
                <span className="badge bg-warning text-dark">
                  Cambios sin guardar
                </span>
              )}
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={handleResetOrder}
                disabled={saving || !hasChanges}
                title="Restablecer orden original"
              >
                <MdRefresh />
              </button>

              <button
                className="btn btn-search"
                onClick={handleSaveOrder}
                disabled={saving || !hasChanges}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <MdSave className="me-2" />
                    Guardar Orden
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Lista de planes con drag and drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedPlanes.map(plan => plan.id_plan.toString())}
              strategy={verticalListSortingStrategy}
            >
              <div className="plan-list">
                {orderedPlanes.map((plan, index) => (
                  <SortablePlanItem
                    key={plan.id_plan}
                    plan={plan}
                    index={index}
                    onMoveUp={moveUp}
                    onMoveDown={moveDown}
                    totalItems={orderedPlanes.length}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Mensaje si no hay planes */}
          {orderedPlanes.length === 0 && (
            <div className="text-center py-5">
              <h5 className="text-muted">No hay planes disponibles</h5>
              <p className="text-muted">
                Los planes aparecerán aquí cuando estén disponibles en el sistema.
              </p>
            </div>
          )}

          {/* Información adicional */}
          {orderedPlanes.length > 0 && (
            <div className="mt-4 p-3 bg-light rounded">
              <small className="text-muted">
                <strong>Nota:</strong> El orden que definas aquí será el mismo orden en que aparecen
                los planes en el formulario de búsqueda de la cartilla. Los planes inactivos seguirán
                apareciendo en esta lista para que puedas organizar su orden, pero no serán visibles
                en el formulario público.
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Botón volver */}
      <div className="back-button-container">
        <button className="back-button" onClick={handleVolver}>
          <MdSubdirectoryArrowLeft />
          <span>Volver</span>
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default PlanOrderManager;