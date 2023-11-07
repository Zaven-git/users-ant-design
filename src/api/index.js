import axios from 'axios';

class UserApi {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }
    async getUsers() {
        try {
            return await axios.get(`${this.apiUrl}`);
        } catch (error) {
            console.error('Error while fetching the users list', error);
        }
    };
    async addNewUser(newUser) {
        try {
            return await axios.post(`${this.apiUrl}`, newUser);
        } catch (error) {
            console.error('Error while adding a new user:', error);
        }
    };
    async updateUser(userId, updatedUser) {
        try {
            return await axios.put(`${this.apiUrl}/${userId}`, updatedUser);
        } catch (error) {
            console.error('Error while updating user:', error);
        }
    };
    async deleteUser(userId) {
        try {
            return await axios.delete(`${this.apiUrl}/${userId}`);
        } catch (error) {
            console.error('Error while removing user:', error);
        }
    };
}

export default UserApi;