"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import '../components/Home.scss'


const Home = () => {
    const [showModal, setShowModal] = useState(false);
    const [containerName, setContainerName] = useState("");
    const [technology, setTechnology] = useState("");
    const [folderPath, setFolderPath] = useState("");
    const [loading, setLoading] = useState(false);
    const Loader = () => {
        return (
            <>
            <div className="bodycube">
        <div className="scene">
        <div className="cube-wrapper">
          <div className="cube">
            <div className="cube-faces">
              <div className="cube-face shadow">hi</div>
              <div className="cube-face bottom"></div>
              <div className="cube-face top"></div>
              <div className="cube-face left"></div>
              <div className="cube-face right"></div>
              <div className="cube-face back"></div>
              <div className="cube-face front"></div>
            </div>
          </div>
        </div>
      </div></div>
            </>
        )
    }

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleCreate = async () => {
        setLoading(true)
        console.log("Create button clicked");
        console.log("Container Name:", containerName);
        console.log("Technology:", technology);
        console.log("Folder Path:", folderPath);
        //logic to handle the creation process
        const res = await axios.post("http://localhost:3000/docker/container/create",{
            name: containerName,
            package: technology,
            filepath: `Desktop/${folderPath}`
        })
        if (res.data) {
            setLoading(false);
            setContainerName("")
            setTechnology("")
            setFolderPath("")
            handleCloseModal();
        }
    };
    const handleFolderSelect = async () => {
        try {
            const result = await window.showDirectoryPicker();
            setFolderPath(result.name);
        } catch (err) {
            console.error('Error selecting folder:', err);
        }   
    };

    return (
        <>
        <div className="flex justify-between items-center w-full h-20 px-4 text-white bg-[#121212] rounded-lg border border-gray-500 mt-10">
            <div>
                <h1 className="text-5xl font-signature ml-8">
                    <Link href="/">
                        InstaCode
                    </Link>
                </h1>
            </div>

            <div>
                <button onClick={handleOpenModal} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 mr-8 rounded-lg">
                    Create +
                </button>
            </div>

            {showModal && (

                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center">
                    <div className="bg-gray-800 bg-opacity-90 rounded-lg p-8 shadow-lg">
                        <h2 className="text-2xl mb-6 text-green-500">Create Your Container</h2>
                        <div className="mb-4">
                            <input
                                type="text"
                                id="containerName"
                                placeholder="Name"
                                value={containerName}
                                onChange={(e) => setContainerName(e.target.value)}
                                className="w-full border p-2 rounded bg-gray-800 text-green-500"
                            />
                        </div>
                        <div className="mb-4">
                            <select
                                id="technology"
                                value={technology}
                                onChange={(e) => setTechnology(e.target.value)}
                                className="w-full border p-2 rounded bg-gray-800 text-green-500"
                            >
                                <option value="">Select Technology</option>
                                <option value="nodelts">Node-21</option>
                                <option value="node21">Node-20</option>
                                <option value="node18">Node-18</option>
                                <option value="python">Python</option>
                                <option value="rust">Rust</option>
                            </select>
                        </div>
                        <div className="mb-4 flex">
                            
                            <input
                                    type="text"
                                    id="folderPath"
                                    value={folderPath}
                                    placeholder="Select Folder"
                                    readOnly
                                    className="w-full border p-2 rounded bg-gray-800 text-green-500 mr-2"
                                />
                                <button
                                    onClick={handleFolderSelect}
                                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
                                >
                                    Select
                                </button>
                        </div>
                        <div className="flex justify-center items-center">
                            <button onClick={handleCreate} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg mr-2">Create</button>
                            <button onClick={handleCloseModal} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        {loading && (
            <Loader />
        )}
      </>
    );
};

const ImageNavbar = ({ imageName }) => {
    const [status, setStatus] = useState([]);
    const [isStarted, setIsStarted] = useState(false);
    const [dockerData, setDockerData] = useState([])
    const [id, setId] = useState([]);
    const [img, setImg] = useState([]);

    const dockerFetch = async () => {
        const res = await axios.get('http://localhost:3000/docker')
        let test = [];
        let testId = [];
        let testStatus = [];
        let testImg = [];
        for (let i = 0; i < res.data.length; i++) {
            let str = res.data[i].Names[0].slice(1)
            let newId = res.data[i].Id.slice(0, 10);
            let newStatus = res.data[i].State;
            let newImg = res.data[i].Image;
            test.push(str)
            testId.push(newId);
            testStatus.push(newStatus);
            testImg.push(newImg);
        }
        setDockerData(res.data)
        console.log(testImg)
        setId(testId);
        console.log(testStatus)
        setStatus(testStatus)
        setImg(testImg)
    }

    useEffect(() => {
        dockerFetch();
    }, [])

    const handleStart = (id) => {
        setIsStarted(false)
    };

    const handleStop = (id) => {
        // Add logic to stop the image
        setIsStarted(true);
        console.log(dockerData[id].State);
    };

    const handleDelete = async (id) => {
        // Add logic to delete the image
        if (isStarted) {
            console.log("Stop Container first");
        } else {
            console.log("Image deleted");
        }
        // const res = await axios.post(`http://localhost:3000/docker/container/remove/${id}`)
        // console.log(res.data);
    };
    return (
        <div className="mt-10">
            {dockerData.map((data, index) => (
                <div className="flex justify-between items-center w-full h-16 px-4 text-white bg-[#121212] rounded-lg border border-green-500" key={index}>
                    <div>
                        <p className="text-lg">
                            <span className="">Container Name:  </span>
                            <span className="opacity-50">{img[index]}</span>
                        </p>
                    </div>
                    <div>
                        <button onClick={handleStart} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full mr-2 disabled:opacity-50" disabled={true}>Start</button>
                        <button onClick={handleStop} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full mr-2 disabled:opacity-50" disabled={false}>Stop</button>
                        <button onClick={() => {handleDelete}} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full">Delete</button>
                    </div>
                </div>
            ))}
        </div>
    );
};
export { Home, ImageNavbar };