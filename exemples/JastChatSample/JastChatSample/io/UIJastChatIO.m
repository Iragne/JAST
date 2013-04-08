//
//  UIJastChatIO.m
//  JastChatSample
//
//  Created by adelskott on 06/04/13.
//  Copyright (c) 2013 adelskott. All rights reserved.
//

#import "UIJastChatIO.h"
#import "SocketIOPacket.h"
#import "SocketIOJSONSerialization.h"

static UIJastChatIO* UIJastChatIO_instance = nil;


@implementation UIJastChatIO

+(UIJastChatIO*)getInstance{
    if (!UIJastChatIO_instance){
        UIJastChatIO_instance = [UIJastChatIO new];
        UIJastChatIO_instance.isConnect = NO;
    }
    return UIJastChatIO_instance;
}


-(void)socketconnect{
    self.isConnect = NO;
    socketIO = [[SocketIO alloc] initWithDelegate:self];
    [socketIO connectToHost:@"jast-io.com" onPort:80 withParams:nil withNamespace:@"/ns"];
}

- (void) socketIODidDisconnect:(SocketIO *)socket disconnectedWithError:(NSError *)error{
    self.isConnect = NO;
    activechannels = nil;
    if(run){
        [self performSelector:@selector(socketconnect) withObject:nil afterDelay:2];
    }else{
        socketIO.delegate = nil;
        socketIO = nil;
    }
}

- (void) socketIO:(SocketIO *)socket onError:(NSError *)error{
    self.isConnect = NO;
    activechannels = nil;
    [self performSelector:@selector(socketconnect) withObject:nil afterDelay:2];
}


- (void) socketIODidConnect:(SocketIO *)socket{
    run = YES;
    self.isConnect = YES;
    NSLog(@"Connected");
    [self connectChannel:@"peoplelist" getold:YES];
    for (NSDictionary *e in channels) {
        [self connectChannel:e[@"channel"] getold:[e[@"old"] boolValue]];
    }
    for (NSDictionary *e in waittingActions){
        [socketIO sendEvent:@"publish" withData:e];
    }
    waittingActions = nil;
}

-(void)connectChannel:(NSString*)channel getold:(BOOL)getold{
    BOOL found = NO;
    for (NSString *e in activechannels) {
        if ([e isEqualToString:channel]){
            found = YES;
            break;
        }
    }
    if (found)
        return;
    NSDictionary *dict = @{@"client":_clientid, @"key": _key, @"app":_appid,@"channel":channel};
    [socketIO sendEvent:@"psubscribe" withData:dict];
    if (!channels)
        channels = [NSMutableArray new];
    found = NO;
    for (NSDictionary *e in channels) {
        if ([e[@"channel"] isEqualToString:channel]){
            found = YES;
            break;
        }
    }
    if(!found)
        [channels addObject:@{@"channel": channel,@"old":@(getold)}];
    
    found = NO;
    if (!activechannels)
        activechannels = [NSMutableArray new];
    for (NSString *e in activechannels) {
        if ([e isEqualToString:channel]){
            found = YES;
            break;
        }
    }
    if(!found)
        [activechannels addObject:channel];
}

- (void) socketIO:(SocketIO *)socket didReceiveEvent:(SocketIOPacket *)packet{
    NSLog(@"%@",packet.data);
    NSDictionary *d = [packet dataAsJSON];
    NSString *str = nil;
    if (d){
        NSArray *ar = d[@"args"];
        if ([ar count])
            str = ar[0];
    }
    
    NSData *utf8Data = [str dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *json = [SocketIOJSONSerialization objectFromJSONData:utf8Data error:nil];
    NSString *channel = json[@"channel"];
    NSDictionary *dic = json[@"data"];
    
    if (callbacks[channel]){
        void(^rep)(NSDictionary* rep) = callbacks[channel];
        rep(dic);
    }
}
-(void)listen:(NSString*)channel getold:(BOOL)getold cb:(void(^)(NSDictionary* rep))cb{
    if (!callbacks) {
        callbacks = [NSMutableDictionary new];
    }
    if (cb)
        [callbacks setObject:[cb copy] forKey:channel];
    else
        [callbacks removeObjectForKey:channel];
    [self connectChannel:channel getold:getold];
        
}
-(void)sendmessage:(NSString*)channel message:(id)message{
    NSDictionary *dict = @{@"client":_clientid, @"key": _key, @"app":_appid,@"channel":channel,@"message":message};
    if (self.isConnect)
        [socketIO sendEvent:@"publish" withData:dict];
    else{
        if (!waittingActions)
            waittingActions = [NSMutableArray new];
        [waittingActions addObject:dict];
    }
}

@end


