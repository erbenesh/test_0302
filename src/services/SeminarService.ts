import axios from "axios";

class SeminarService { 

  PORT = 'http://localhost:3000/seminars';

  async getSeminars() {

    const data = await axios.get(this.PORT);

    return data;
  }

  async setSeminar(id: string | number, obj: object) {

    const data = await axios.patch(this.PORT+`/${id}`, obj);

    return data;
  }

  async deleteSeminar(id: string | number) {

    const data = await axios.delete(this.PORT + `/${id}`);

    return data;
  }

}

export const seminarService = new SeminarService();