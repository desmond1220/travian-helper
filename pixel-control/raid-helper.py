import pyautogui
import time
import random

PAUSE_BETWEEN_ACTION = 0.5 # in sec

SLAVE_VALIDATION_POSITION = (1094 + 1920, 575)
SLAVE_VALIDATION_COLOR = (67, 60, 55)

FARM_LIST_LINK_POSITION = (349 + 1920, 929)
FARM_LIST_LINK_COLOR = (255, 249, 235)

ALL_RAID_POSITION = (689 + 1920, 540)
ALL_RAID_COLOR = (255, 255, 255)

START_RAID_POSITION = (1120 + 1920, 494)
START_RAID_COLOR = (172, 205, 119)

TO_RESOURCES_POSITION = (678 + 1920, 107)
TO_RESOURCES_COLOR = (206, 157, 70)

def random_pause_between_actions():
    time.sleep(random.randint(5, 10))

def validate_position(position, color):
    px = pyautogui.pixel(position[0], position[1])
    if px == color:
        # print("Color validation match")
        return True
    else:
        print("Not match", position)
        print(color)
        print(px)
        return False

def move_and_click(position, color):
    pyautogui.moveTo(position[0], position[1])
    time.sleep(PAUSE_BETWEEN_ACTION)

    # if validate_position(pyautogui.position(), color):
    print("Execute CLICK")
    pyautogui.click()

def wait_till_troops_avaliable():
    while not troops_avaliable():
        move_and_click(TO_RESOURCES_POSITION, TO_RESOURCES_COLOR)
        random_pause_between_actions()
    return True

def troops_avaliable():
    if validate_position(SLAVE_VALIDATION_POSITION, SLAVE_VALIDATION_COLOR):
        print("Troops avaliable")
        return True
    else:
        print("Pending troops...")
        return False

def raid_by_schedule():
    while wait_till_troops_avaliable():
        random_pause_between_actions()
        move_and_click(FARM_LIST_LINK_POSITION, FARM_LIST_LINK_COLOR)
        random_pause_between_actions()
        move_and_click(ALL_RAID_POSITION, ALL_RAID_COLOR)
        random_pause_between_actions()
        move_and_click(START_RAID_POSITION, START_RAID_COLOR)
        print("Raid executed")
        random_pause_between_actions()
        move_and_click(TO_RESOURCES_POSITION, TO_RESOURCES_COLOR)

        print("Wait for next execution...")
        time.sleep(60*60)

raid_by_schedule()