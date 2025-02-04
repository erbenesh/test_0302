import { useEffect, useState } from 'react'
import {seminarService} from './services/SeminarService'
import './App.css'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SeminarCard } from './components/SeminarCard'

interface ISeminar {
  id: number | string,
  title: string,
  date: number | string,
  time: number | string,
  description: string,
  photo: string
}

function App() {

  const [ seminars, setSeminars ] = useState(null);
  
  const [ currentToDelete, setCurrentToDelete ] = useState(null);

  const [ currentToEditID, setCurrentToEditID ] = useState(null);

  const [ isModalDeleteOpened, setModalDeleteOpened ] = useState(false);

  const [ isModalEditOpened, setModalEditOpened ] = useState(false);

  const [ newLocalObject, setNewLocalObject ] = useState(null);

  //inputs values
  const [ titleValue, setTitleValue ] = useState(null);
  const [ descriptionValue, setDescriptionValue ] = useState(null);
  const [ timeValue, setTimeValue ] = useState(null);
  const [ dateValue, setDateValue ] = useState(null);
  const [ imageValue, setImageValue ] = useState(null);

  const queryClient = useQueryClient();

  //Запросы
  const getSeminars = useQuery({
    queryKey: ['get seminars'],
    queryFn: () => seminarService.getSeminars()
  });

  const setSeminar = useMutation({
    mutationKey: ['set seminar', currentToEditID],
    mutationFn: (obj) => seminarService.setSeminar(currentToEditID, obj),
    onSuccess() {
      queryClient.refetchQueries({queryKey: ['get seminars']});
    }
  });

  const deleteSeminar = useMutation({
    mutationKey: ['delete seminar'],
    mutationFn: (currentToDelete) => seminarService.deleteSeminar(currentToDelete),
    onSuccess() {
      queryClient.refetchQueries({queryKey: ['get seminars']});
    }
  });

  //выгрузка данных запроса в случае успеха при изменении статуса, так как не сразу получаем список и могут быть проблемы при отображении(к примеру отсутствие title/description просто будет выводить ошибку)
  useEffect(() => {

    function loadInitialSeminars() {
      const data = getSeminars.data?.data;

      console.log(data);

      setSeminars(data);
    }
    
    if(getSeminars.isSuccess) {
      loadInitialSeminars();
    }
    
  }, [getSeminars.status]);

  //дальше идет логика удаления и редактирования семинаров. можно вынести в хуки, но проект для такого маловат
  const deleteFromLocal = () => {
    if(currentToDelete) {
      const newSeminars = seminars.filter(el => el.id !== currentToDelete);

      setSeminars(newSeminars);
    }
  }

  const setOpenedModalDelete = (id: string | number) => {
    setModalDeleteOpened(true);
    setCurrentToDelete(id);
  }

  const declineDelete = () => {
    setModalDeleteOpened(false);
    setCurrentToDelete(null);
  }

  const confirmDelete = () => {

    //  здесь мы делаем мутацию семинара, отправляя DELETE запрос на сервере, после чего так же обновляем локальное состояние списка

    deleteSeminar.mutate(currentToDelete);

    setModalDeleteOpened(false);

    deleteFromLocal();

    setCurrentToDelete(null);
  }



  const equalInputsValuesStates = (obj: object) => {
    setCurrentToEditID(obj.id);
    setTitleValue(obj.title);
    setDescriptionValue(obj.description);
    setTimeValue(obj.time);
    setDateValue(obj.date);
    setImageValue(obj.photo);
  }

  const setOpenedModalEdit = (obj: object) => {
    setModalEditOpened(true);

    equalInputsValuesStates(obj);

  }

  const declineEdit = () => {
    setModalEditOpened(false);
  }
  
  const editLocal = (obj: object) => {
    if(currentToEditID) {

      const newSeminars: [] = seminars.filter(el => el.id !== currentToEditID);

      newSeminars.push(obj);

      setSeminars(newSeminars);
    }
  }

  const setNewSeminar = () => {

    //тут парсим инпуты и создаем объект обновленного семинара, после чего будем его патчить в бд по его id

    let inputAll = Array.from(document.querySelectorAll('#forms input'));
    let obj = {};

    let checkFieldsLength = inputAll.every((el) => el.value.length);

    if (checkFieldsLength) {
        for (const input of inputAll) {
            obj[input.id] = input.value;
        }

        setSeminar.mutate(obj);
        obj['id'] = currentToEditID;
        setNewLocalObject(obj);

        return console.log('Изменен семинар: ', obj);
    }
    return alert('Не все поля заполнены');
  }

  useEffect(() => {

    if(setSeminar.isSuccess) editLocal(newLocalObject);

  }, [setSeminar.status])


  const submitEdit = () => {

    setNewSeminar();

    setModalEditOpened(false);

  }

  //ловим ошибки запросов
  if(getSeminars.isError) {
    return ('An error has occurred: ' + getSeminars.error.message);
  } else if(deleteSeminar.isError) {
    return ('An error has occurred: ' + deleteSeminar.error.message);
  } else if(setSeminar.isError) {
    return ('An error has occurred: ' + setSeminar.error.message);
  }

  return (
    //  танстак сам регулирует состояние загрузки, но так же необходимо добавить состояние локального списка, 
    //  чтобы не было проблемы, что загрузка кончилась ошибкой, список пустой, а рендер выдает ошибки отсутствия данных
    getSeminars.isFetching || deleteSeminar.isPending || setSeminar.isPending || !seminars ? 
    <div className="loader-container">	
      <i className="loader-circle"></i>
    </div>
    : 
    <div>

      <h1>Seminars</h1>

      <div className='seminars_list'>

        { 
          seminars.map((el: ISeminar) => el.id && <SeminarCard key={el.id} el={el} setOpenedModalDelete={setOpenedModalDelete} setOpenedModalEdit={setOpenedModalEdit}/>)
        }

      </div>

      { 
      isModalDeleteOpened &&
        <div className='to_delete_modal_background'>
          <div className='to_delete_modal'>
            Вы действительно хотите удалить этот семинар?
            <div className='to_delete_modal_buttons'>
              <button onClick={() => confirmDelete()} type='button'>Да</button>
              <button onClick={() => declineDelete()} type='button'>Отмена</button>
            </div>
          </div>
        </div>
      }

      { 
      isModalEditOpened &&
        <div className='to_delete_modal_background'>
          <div className='to_delete_modal'>

            <form id="forms" className='edit_form' action="submit">

              <label htmlFor="edit_input_title">Название</label>
              <input className='edit_input' id='title' onChange={el => setTitleValue(el.currentTarget.value)} value={titleValue} />

              <label htmlFor="edit_input_description">Описание</label>
              <input className='edit_input' id='description' onChange={el => setDescriptionValue(el.currentTarget.value)} value={descriptionValue} />

              <label htmlFor="edit_input_time">Время</label>
              <input className='edit_input' id='time' onChange={el => setTimeValue(el.currentTarget.value)} value={timeValue} />

              <label htmlFor="edit_input_date">Дата</label>
              <input className='edit_input' id='date' onChange={el => setDateValue(el.currentTarget.value)} value={dateValue} />

              <label htmlFor="edit_input_photo">Ссылка на постер</label>
              <input className='edit_input' id='photo' onChange={el => setImageValue(el.currentTarget.value)} value={imageValue} />

            </form>

            <div className='to_delete_modal_buttons'>
              <button onClick={() => submitEdit()} type='button'>Изменить</button>
              <button onClick={() => declineEdit()} type='button'>Отмена</button>
            </div>
          </div>
        </div>
      }

    </div>
  )
}

export default App

