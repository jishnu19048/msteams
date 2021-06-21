import React from 'react'
import { Col } from 'react-grid-system'
import { Row } from 'react-grid-system'
import { makeStyles, useTheme, fade } from '@material-ui/core/styles';
import { ChatEngineWrapper, Socket, ChatFeed, ChatList, ChatSettings } from 'react-chat-engine'
const ChatForm = () => {
    return (
        <ChatEngineWrapper>
            <Row>
                <Col xs={0} sm={4}>
                    <ChatList activeChat={123} />
                </Col>
                <Col sm={8}>
                    <ChatFeed/>
                </Col>
            </Row>
        </ChatEngineWrapper>
    )
}

export default ChatForm