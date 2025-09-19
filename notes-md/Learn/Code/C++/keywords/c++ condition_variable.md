#include <iostream>

#include <condition_variable>

#include <mutex>

#include <thread>

#include<chrono>



std::mutex mutex_;

std::condition_variable condVar;



bool g_bThreadExit = false;

std::mutex g_mtxThreadExit;



bool dataReady = false;



void doTheWork()

{

    std::cout << "Processing shared data." << std::endl;

}



void waitingForWork()

{

    while(true)

    {



        {

            std::unique_lock<std::mutex> lck(mutex_);

            while(!dataReady)

            {

                std::cout << "Worker: Waiting for work." << std::endl;

                condVar.wait(lck,[&]() {return dataReady;});

            }

            dataReady = false;

            doTheWork();

            std::cout << "Work done." << std::endl;

            lck.unlock();

        }



        {

            std::unique_lock <std::mutex> lck(g_mtxThreadExit);

            if (g_bThreadExit)

            {

                std::cout << "Exit thread" << std::endl;

                break;

            }

        }

    }



}



void setDataReady()

{

    std::unique_lock <std::mutex> lck(mutex_);

    dataReady=true;

    std::cout << "Sender: Data is ready."  << std::endl;

    condVar.notify_all();

}



int main()

{



    std::cout << std::endl;



    std::thread t1(waitingForWork);

    t1.detach();

    int i = 10;

    while(i--)

    {

        setDataReady();

        std::this_thread::sleep_for(std::chrono::milliseconds(10000));

        std::cout<<"sleep 1"<<std::endl;

        std::cout<<std::endl;

    }

    std::unique_lock <std::mutex> lck(g_mtxThreadExit);

    g_bThreadExit = true;

    std::cout << "Begin Exit" << std::endl;



}

