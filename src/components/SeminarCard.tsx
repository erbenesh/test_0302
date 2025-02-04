import styles from './SeminarCard.module.css'

import { RiEditLine } from "react-icons/ri";
import { FaRegTrashAlt } from "react-icons/fa";

export const SeminarCard = (props) => {

    return (
    <div className={styles.card}>

        <div className={styles.action_buttons}>
            <button onClick={() => props.setOpenedModalEdit(props.el)} type='button'> <RiEditLine /> </button>
            <button onClick={() => props.setOpenedModalDelete(props.el.id)} type='button'> <FaRegTrashAlt /> </button>
        </div>

        <div className={styles.post_info}>
            <p className={styles.title}>{props.el?.title}</p>

            <p className={styles.description}>{props.el.description}</p>

            <div className={styles.date_n_time}>

                <span className={styles.time}>{props.el.time}</span> <span className={styles.date}>{props.el.date}</span>

            </div>
        </div>

        <div className={styles.border_image}>
            <img className={styles.image} src={props.el.photo} alt="" />
        </div>

    </div>
    )
}